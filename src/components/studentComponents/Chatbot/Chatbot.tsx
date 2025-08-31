import React, { useState, useEffect, useRef } from 'react';
import { IoChatbubbleEllipses, IoClose, IoPaperPlane } from 'react-icons/io5';
import { useSearchParams } from 'react-router-dom';
import { Get, Post } from '../../../config/apiMethods';
import { displayMessage } from '../../../config';
import './Chatbot.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatSession {
    _id: string;
    messages: Message[];
    context: {
        topicName: string;
        lessonName: string;
        subjectName: string;
    };
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [chatSession, setChatSession] = useState<ChatSession | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();

    // Get content from URL params
    const content = searchParams.get('content');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat session when component mounts
    useEffect(() => {
        if (isOpen && content) {
            initializeChatSession();
        }
    }, [isOpen, content]);

    const initializeChatSession = async () => {
        try {
            // Get lesson and topic info from localStorage or context
            const lessonData = localStorage.getItem('lesson');
            const lessonId = localStorage.getItem('lessonid');

            if (lessonData && lessonId) {
                const lesson = JSON.parse(lessonData);

                // Clean the lessonId - remove any extra quotes
                const cleanLessonId = lessonId.replace(/"/g, '');

                // Create or get chat session
                const response = await Post('/chat/session', {
                    topicId: lesson.topic || lesson._id,
                    lessonId: cleanLessonId,
                    subjectId: lesson.subject,
                    contentUrl: content // Pass the content URL from the page
                });

                if (response.success) {
                    setChatSession(response.data);
                    setMessages(response.data.messages || []);
                }
            }
        } catch (error) {
            console.error('Error initializing chat session:', error);
            displayMessage('Failed to initialize chat', 'error');
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !chatSession) return;

        const userMessage: Message = {
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await Post('/chat/message', {
                sessionId: chatSession._id,
                message: userMessage.content
            });

            if (response.success) {
                const aiMessage: Message = {
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: response.data.timestamp
                };

                setMessages(prev => [...prev, aiMessage]);
            } else {
                displayMessage('Failed to send message', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            displayMessage('Failed to send message', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setInputMessage('');
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={toggleChat}
                className="chatbot-toggle-btn"
                title="Chat with AI Assistant"
            >
                <IoChatbubbleEllipses size={24} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-container">
                    {/* Chat Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <h3>AI Learning Assistant</h3>
                            {chatSession?.context && (
                                <p className="chatbot-context">
                                    {chatSession.context.subjectName}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={toggleChat}
                            className="chatbot-close-btn"
                            title="Close Chat"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="chatbot-messages">
                        {messages.length === 0 ? (
                            <div className="chatbot-welcome">
                                <p>👋 Hi! I'm your AI learning assistant.</p>
                                <p>Ask me anything about your current lesson or topic!</p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`chatbot-message ${message.role === 'user' ? 'user' : 'assistant'}`}
                                >
                                    <div className="message-content">
                                        {message.content}
                                    </div>
                                    <div className="message-timestamp">
                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="chatbot-message assistant">
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="chatbot-input-container">
                        <div className="chatbot-input-wrapper">
                            <textarea
                                value={inputMessage}
                                onChange={(e) => {
                                    setInputMessage(e.target.value);
                                    const textarea = e.target as HTMLTextAreaElement;
                                    textarea.style.height = 'auto';
                                    textarea.style.height = textarea.scrollHeight + 'px';
                                }}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about your lesson..."
                                className="chatbot-input"
                                rows={1}
                                disabled={isLoading}
                                style={{ height: 'auto', overflow: 'hidden', resize: 'none' }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="chatbot-send-btn"
                                title="Send Message"
                            >
                                <IoPaperPlane size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
