"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Formatters_1 = require("./Formatters");
class JsonHubProtocol {
    constructor() {
        this.name = "json";
        this.type = 1 /* Text */;
    }
    parseMessages(input) {
        if (!input) {
            return [];
        }
        // Parse the messages
        let messages = Formatters_1.TextMessageFormat.parse(input);
        let hubMessages = [];
        for (var i = 0; i < messages.length; ++i) {
            hubMessages.push(JSON.parse(messages[i]));
        }
        return hubMessages;
    }
    writeMessage(message) {
        return Formatters_1.TextMessageFormat.write(JSON.stringify(message));
    }
}
exports.JsonHubProtocol = JsonHubProtocol;
