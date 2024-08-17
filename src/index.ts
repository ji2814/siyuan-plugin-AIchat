import "./index.scss";

import { Plugin } from "siyuan";
import { createApp } from "vue";
import { SettingUtils } from "./libs/setting-utils";

import App from "./app.vue";

const STORAGE_NAME = "AIchat-storage";
export default class AIchat extends Plugin {
    settingUtils: SettingUtils;

    onload() {

        // settings
        this.settingUtils = new SettingUtils({
            plugin: this, name: STORAGE_NAME
        });
        this.settingUtils.addItem({
            key: "model",
            value: "",
            type: "textinput",
            title: "model",
            description: "大模型名称",
            action: {
                // Called when focus is lost and content changes
                callback: () => {
                    // Return data and save it in real time
                    this.settingUtils.takeAndSave("model");
                }
            }
        });

        this.settingUtils.addItem({
            key: "baseUrl",
            value: "",
            type: "textinput",
            title: "base_url",
            description: "请求的基础地址",
            action: {
                // Called when focus is lost and content changes
                callback: () => {
                    // Return data and save it in real time
                    this.settingUtils.takeAndSave("baseUrl");
                }
            }
        });

        this.settingUtils.addItem({
            key: "apiKey",
            value: "",
            type: "textinput",
            title: "api key",
            description: "api密钥",
            action: {
                // Called when focus is lost and content changes
                callback: () => {
                    // Return data and save it in real time
                    this.settingUtils.takeAndSave("apiKey");

                }
            }
        });


        try {
            this.settingUtils.load();
        } catch (error) {
            console.error("Error loading settings storage, probably empty config json:", error);
        }

        // icon
        this.addIcons(`<symbol id="iconRobot" viewBox="0 0 32 32">
                        <svg t="1723886221650" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5640" width="32" height="32"><path d="M717.12 274H762c82.842 0 150 67.158 150 150v200c0 82.842-67.158 150-150 150H262c-82.842 0-150-67.158-150-150V424c0-82.842 67.158-150 150-150h44.88l-18.268-109.602c-4.086-24.514 12.476-47.7 36.99-51.786 24.514-4.086 47.7 12.476 51.786 36.99l20 120c0.246 1.472 0.416 2.94 0.516 4.398h228.192c0.1-1.46 0.27-2.926 0.516-4.398l20-120c4.086-24.514 27.272-41.076 51.786-36.99 24.514 4.086 41.076 27.272 36.99 51.786L717.12 274zM262 364c-33.138 0-60 26.862-60 60v200c0 33.138 26.862 60 60 60h500c33.138 0 60-26.862 60-60V424c0-33.138-26.862-60-60-60H262z m50 548c-24.852 0-45-20.148-45-45S287.148 822 312 822h400c24.852 0 45 20.148 45 45S736.852 912 712 912H312z m-4-428c0-24.852 20.148-45 45-45S398 459.148 398 484v40c0 24.852-20.148 45-45 45S308 548.852 308 524v-40z m318 0c0-24.852 20.148-45 45-45S716 459.148 716 484v40c0 24.852-20.148 45-45 45S626 548.852 626 524v-40z" fill="#444444" p-id="5641"></path></svg>
                        </symbol>`);

        // dock
        this.addDock({
            config: {
                position: "RightTop",
                size: { width: 300, height: 300 },
                icon: "iconRobot",
                title: "AIchat",
            },

            data: {
                text: "data",
            },

            type: "type",

            init: (dock) => {

                let element = dock.element;
                element.id = "app";
                // console.log(element);

                createApp(App,
                    {
                        plugin: this
                    }).mount("#app");

            },

        });

    };

}