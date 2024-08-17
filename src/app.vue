<template>
    <div class="common-layout">
        <el-header class="header-container">
            <div class="titie">AI chat</div>
            <div class="title-right">
                <el-button class="clear" type="text" @click="initMassageList">clear</el-button>
                <!-- <el-button class="reload" type="text" @click="">reload</el-button> -->
            </div>
        </el-header>

        <el-main>
            <div class="chat-window" ref="chatListDom">
                <div class="chat-itms" v-for="item of messageList.filter((v) => v.role !== 'system')">
                    <el-card>
                        <template #header>
                            <div class="chat-header">
                                <div class="chat-role">{{ item.role }}：</div>
                                <el-button type="text" @click="copy">copy</el-button>
                            </div>
                        </template>
                        <div class="chat-content" v-if="item.content" v-html="renderMd(item.content)"
                            contenteditable="true" spellcheck="false">
                        </div>
                    </el-card>
                </div>
            </div>
        </el-main>

        <el-footer>
            <div class="footer">
                <el-row :gutter="10" justify="space-evenly">
                    <el-col :span="16">
                        <el-input v-model="msgContent" style="width: 100%" :rows="1" type="textarea"
                            @keydown.native.enter="sendText" placeholder="Please input" />
                    </el-col>
                    <el-col :span="8">
                        <el-button type="primary" :disabled="isTalking" @click="sendText">
                            Send
                        </el-button>
                    </el-col>
                </el-row>
            </div>
        </el-footer>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { marked } from "marked";
import AIchat from "./index";

import { ChatMessage } from "./types/chatTypes";
import { chat } from "./libs/chatRespond";

const props = defineProps<{
    plugin: AIchat
}>()

const settingUtils = props.plugin.settingUtils;
let apiKey = "";
let baseUrl = "";
let modelName = "";
const prompt = "你是一个AIchat助手，擅长帮助人们解决各种问题。"
    ;
const chatListDom = ref<HTMLDivElement>();
const msgContent = ref('');
let isTalking = ref(false);
const decoder = new TextDecoder("utf-8");
const messageList = ref<ChatMessage[]>([
    {
        role: "system",
        content: prompt,
    },
    {
        role: "assistant",
        content: `hello, AIchat!`,
    },
]);

const sendText = async () => {
    try {
        // initMassageList();
        loadConfig();
        if (!msgContent.value) return;
        // if (messageList.value.length === 2) {
        //     messageList.value.pop();
        // }
        isTalking.value = true;
        console.log("sendText:", msgContent.value);
        messageList.value.push({
            role: "user",
            content: msgContent.value,
        });
        messageList.value.push({
            role: "assistant",
            content: ''
        });

        const { body, status } = await chat(messageList.value, baseUrl, modelName, apiKey);
        clearTextarea();
        if (body) {
            const reader = body.getReader();
            await readStream(reader, status);
        }
    } catch (error: any) {
        appendLastMessageContent(error);
    } finally {
        isTalking.value = false;
    }
};

const copy = () => {
    const lastMessage = messageList.value[messageList.value.length - 1];
    if (lastMessage.role === 'assistant') {
        navigator.clipboard.writeText(lastMessage.content);
    }
}

const clearTextarea = () => {
    msgContent.value = '';
}

const initMassageList = () => {
    messageList.value = [
        {
            role: "system",
            content: prompt,
        },
        {
            role: "assistant",
            content: `hello, AIchat!`,
        },
    ];
};

const loadConfig = () => {
    settingUtils.load();
    apiKey = settingUtils.get("apiKey") as string;
    baseUrl = settingUtils.get("baseUrl") as string;
    modelName = settingUtils.get("model") as string;
    // console.log(apiKey, baseUrl, modelName);
}

const renderMd = (content: string) => {
    return marked(content);
};

const readStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    status: number
) => {
    let partialLine = "";

    while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await reader.read();
        if (done) break;

        const decodedText = decoder.decode(value, { stream: true });

        if (status !== 200) {
            const json = JSON.parse(decodedText); // start with "data: "
            const content = json.error.message ?? decodedText;
            appendLastMessageContent(content);
            return;
        }

        const chunk = partialLine + decodedText;
        const newLines = chunk.split(/\r?\n/);

        partialLine = newLines.pop() ?? "";

        for (const line of newLines) {
            if (line.length === 0) continue; // ignore empty message
            if (line.startsWith(":")) continue; // ignore sse comment message
            if (line === "data: [DONE]") return; //

            const json = JSON.parse(line.substring(6)); // start with "data: "
            const content =
                status === 200
                    ? json.choices[0].delta.content ?? ""
                    : json.error.message;
            appendLastMessageContent(content);
        }
    }
};

const appendLastMessageContent = (content: string) =>
    (messageList.value[messageList.value.length - 1].content += content);

const scrollToBottom = () => {
    if (!chatListDom.value) return;
    scrollTo(0, chatListDom.value.scrollHeight);
};

watch(messageList.value, () => nextTick(() => scrollToBottom()));
</script>

<style lang="scss">
.header-container {
    display: flex;
    /* 启用Flexbox布局 */
    justify-content: space-between;
    /* 子元素分散对齐 */
    align-items: center;
    /* 垂直居中对齐 */
    height: 60px;
    /* 可以设置一个具体的高度 */
    padding: 0 20px;
}

.title {
    font-size: 20px;
    font-weight: bold;
}

.title-right {}

.clear {
    /* 可以根据需要添加样式 */
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 10px;
    padding: 0 0px;
}

.chat-role {
    font-weight: bold;
}

.chat-content {
    padding: 0%
}

.chat-content[contenteditable="true"] {
    outline: none;
}

.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}

.footer {
    position: absolute;
    left: auto;
    bottom: 0;
    width: 100%;
}
</style>