import { ChatMessage } from "@/types/chatTypes";

export async function chat(messageList: ChatMessage[], base_url: string, model: string, apiKey: string) {
    try {
      const result = await fetch(base_url, {
        method: "post",
        // signal: AbortSignal.timeout(8000),
        // 开启后到达设定时间会中断流式输出
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          stream: true,
          messages: messageList,
        }),
      });
      return result;
    } catch (error) {
      throw error;
    }
  }