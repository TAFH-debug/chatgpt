'use client'
import {io, Socket} from 'socket.io-client';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {useEffect, useRef, useState} from "react";
import axios from 'axios';

const BACKEND_URL = "http://localhost:3000";

type Message = {
    author: string,
    content: string
}

export function MainPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSent, setIsSent] = useState(false);
    const [message, setMessage] = useState('');
    const socket = useRef<Socket | null>(null);

    const sendMessage = () => {
        axios.post(BACKEND_URL + "/gpt", {
            text: message
        }).then(
            () => setIsSent(false)
        );
        setMessages([...messages, {
            author: "user",
            content: message
        }]);
        setMessage("");
        setIsSent(true);
    }

    useEffect(() => {
        socket.current = io(BACKEND_URL);
        
        socket.current.on('connect', () => {
            console.log("Connected");
        });

        socket.current.on("messages", (messages) => {
            setMessages((_) => messages);
            console.log(messages);
        });

        return () => { socket.current!.close() }
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between shadow">
                <div className="text-xl font-bold">ChatGPT</div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                        <SettingsIcon className="w-5 h-5" />
                        <span className="sr-only">Settings</span>
                    </Button>
                    <Avatar className="w-8 h-8 border">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                </div>
            </header>
            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                    {
                        messages.map((message, index) => {
                            return message.author === "user" ?
                                <MessageUser key={index} content={message.content}/> : <MessageBot key={index} content={message.content}/>
                        })
                    }
                </div>
            </div>
            <div className="bg-background border-t px-6 py-4">
                <div className="relative">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        name="message"
                        id="message"
                        rows={1}
                        className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
                    />
                    <Button type="submit" size="icon" className="absolute w-8 h-8 top-3 right-3" onClick={sendMessage}
                            disabled={isSent}>
                        <ArrowUpIcon className="w-4 h-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

function MessageBot({ content }: { content: string }) {
    return (
        <div className="flex items-start gap-4">
            <Avatar className="w-8 h-8 border">
                <AvatarImage src="/placeholder-user.jpg"/>
                <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                <p>{content}</p>
            </div>
        </div>
    )
}

function MessageUser({ content }: { content: string }) {
    return (
        <div className="flex items-start gap-4 justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg p-4 max-w-[80%]">
                <p>
                    {content}
                </p>
            </div>
            <Avatar className="w-8 h-8 border">
                <AvatarImage src="/placeholder-user.jpg"/>
                <AvatarFallback>YO</AvatarFallback>
            </Avatar>
        </div>
    )
}

function ArrowUpIcon(props: { className: string }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m5 12 7-7 7 7"/>
            <path d="M12 19V5"/>
        </svg>
    )
}

function SettingsIcon(props: { className: string }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
