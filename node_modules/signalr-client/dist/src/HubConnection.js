"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("./Observable");
const JsonHubProtocol_1 = require("./JsonHubProtocol");
const Formatters_1 = require("./Formatters");
const Base64EncodedHubProtocol_1 = require("./Base64EncodedHubProtocol");
var Transports_1 = require("./Transports");
exports.TransportType = Transports_1.TransportType;
var HttpConnection_1 = require("./HttpConnection");
exports.HttpConnection = HttpConnection_1.HttpConnection;
var JsonHubProtocol_2 = require("./JsonHubProtocol");
exports.JsonHubProtocol = JsonHubProtocol_2.JsonHubProtocol;
class HubConnection {
    constructor(connection, protocol = new JsonHubProtocol_1.JsonHubProtocol()) {
        this.connection = connection;
        this.protocol = protocol || new JsonHubProtocol_1.JsonHubProtocol();
        this.connection.onDataReceived = data => {
            this.onDataReceived(data);
        };
        this.connection.onClosed = (error) => {
            this.onConnectionClosed(error);
        };
        this.callbacks = new Map();
        this.methods = new Map();
        this.id = 0;
    }
    onDataReceived(data) {
        // Parse the messages
        let messages = this.protocol.parseMessages(data);
        for (var i = 0; i < messages.length; ++i) {
            var message = messages[i];
            switch (message.type) {
                case 1 /* Invocation */:
                    this.invokeClientMethod(message);
                    break;
                case 2 /* Result */:
                case 3 /* Completion */:
                    let callback = this.callbacks.get(message.invocationId);
                    if (callback != null) {
                        callback(message);
                        if (message.type == 3 /* Completion */) {
                            this.callbacks.delete(message.invocationId);
                        }
                    }
                    break;
                default:
                    console.log("Invalid message type: " + data);
                    break;
            }
        }
    }
    invokeClientMethod(invocationMessage) {
        let method = this.methods.get(invocationMessage.target);
        if (method) {
            method.apply(this, invocationMessage.arguments);
            if (!invocationMessage.nonblocking) {
                // TODO: send result back to the server?
            }
        }
        else {
            console.log(`No client method with the name '${invocationMessage.target}' found.`);
        }
    }
    onConnectionClosed(error) {
        let errorCompletionMessage = {
            type: 3 /* Completion */,
            invocationId: "-1",
            error: error ? error.message : "Invocation cancelled due to connection being closed.",
        };
        this.callbacks.forEach(callback => {
            callback(errorCompletionMessage);
        });
        this.callbacks.clear();
        if (this.connectionClosedCallback) {
            this.connectionClosedCallback(error);
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            let requestedTransferMode = (this.protocol.type === 2 /* Binary */)
                ? 2 /* Binary */
                : 1 /* Text */;
            this.connection.features.transferMode = requestedTransferMode;
            yield this.connection.start();
            var actualTransferMode = this.connection.features.transferMode;
            yield this.connection.send(Formatters_1.TextMessageFormat.write(JSON.stringify({ protocol: this.protocol.name })));
            if (requestedTransferMode === 2 /* Binary */ && actualTransferMode === 1 /* Text */) {
                this.protocol = new Base64EncodedHubProtocol_1.Base64EncodedHubProtocol(this.protocol);
            }
        });
    }
    stop() {
        return this.connection.stop();
    }
    stream(methodName, ...args) {
        let invocationDescriptor = this.createInvocation(methodName, args, false);
        let subject = new Observable_1.Subject();
        this.callbacks.set(invocationDescriptor.invocationId, (invocationEvent) => {
            if (invocationEvent.type === 3 /* Completion */) {
                let completionMessage = invocationEvent;
                if (completionMessage.error) {
                    subject.error(new Error(completionMessage.error));
                }
                else if (completionMessage.result) {
                    subject.error(new Error("Server provided a result in a completion response to a streamed invocation."));
                }
                else {
                    // TODO: Log a warning if there's a payload?
                    subject.complete();
                }
            }
            else {
                subject.next(invocationEvent.item);
            }
        });
        let message = this.protocol.writeMessage(invocationDescriptor);
        this.connection.send(message)
            .catch(e => {
            subject.error(e);
            this.callbacks.delete(invocationDescriptor.invocationId);
        });
        return subject;
    }
    send(methodName, ...args) {
        let invocationDescriptor = this.createInvocation(methodName, args, true);
        let message = this.protocol.writeMessage(invocationDescriptor);
        return this.connection.send(message);
    }
    invoke(methodName, ...args) {
        let invocationDescriptor = this.createInvocation(methodName, args, false);
        let p = new Promise((resolve, reject) => {
            this.callbacks.set(invocationDescriptor.invocationId, (invocationEvent) => {
                if (invocationEvent.type === 3 /* Completion */) {
                    let completionMessage = invocationEvent;
                    if (completionMessage.error) {
                        reject(new Error(completionMessage.error));
                    }
                    else {
                        resolve(completionMessage.result);
                    }
                }
                else {
                    reject(new Error("Streaming methods must be invoked using HubConnection.stream"));
                }
            });
            let message = this.protocol.writeMessage(invocationDescriptor);
            this.connection.send(message)
                .catch(e => {
                reject(e);
                this.callbacks.delete(invocationDescriptor.invocationId);
            });
        });
        return p;
    }
    on(methodName, method) {
        this.methods.set(methodName, method);
    }
    set onClosed(callback) {
        this.connectionClosedCallback = callback;
    }
    createInvocation(methodName, args, nonblocking) {
        let id = this.id;
        this.id++;
        return {
            type: 1 /* Invocation */,
            invocationId: id.toString(),
            target: methodName,
            arguments: args,
            nonblocking: nonblocking
        };
    }
}
exports.HubConnection = HubConnection;
