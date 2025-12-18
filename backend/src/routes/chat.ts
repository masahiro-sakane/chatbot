import { Router, Request, Response } from 'express';
import { sendMessage, streamMessage, getModel } from '../services/claudeService';
import { ChatRequest, ChatResponse, Message } from '../types';

const router = Router();

/**
 * POST /api/chat
 * Send a message to Claude and get a response
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], images = [], systemPrompt }: ChatRequest = req.body;

    // Validate request
    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: 'Bad request',
        message: 'Message is required and must be a string',
      });
      return;
    }

    if (message.trim().length === 0) {
      res.status(400).json({
        error: 'Bad request',
        message: 'Message cannot be empty',
      });
      return;
    }

    // Validate conversation history
    if (!Array.isArray(conversationHistory)) {
      res.status(400).json({
        error: 'Bad request',
        message: 'conversationHistory must be an array',
      });
      return;
    }

    // Build user message content with images if provided
    let userContent: string | any[];
    if (images && images.length > 0) {
      userContent = [
        ...images.map((img) => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType,
            data: img.data,
          },
        })),
        {
          type: 'text',
          text: message,
        },
      ];
    } else {
      userContent = message;
    }

    // Build messages array
    const messages: Message[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: userContent,
      },
    ];

    // Call Claude API
    const response = await sendMessage(messages, systemPrompt);

    // Send response
    const chatResponse: ChatResponse = {
      response,
      model: getModel(),
    };

    res.json(chatResponse);
  } catch (error) {
    console.error('Error in /api/chat:', error);

    // Send error response
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to get response from Claude',
    });
  }
});

/**
 * POST /api/chat/stream
 * Send a message to Claude and get a streaming response (SSE)
 */
router.post('/chat/stream', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], images = [], systemPrompt }: ChatRequest = req.body;

    // Validate request
    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: 'Bad request',
        message: 'Message is required and must be a string',
      });
      return;
    }

    if (message.trim().length === 0) {
      res.status(400).json({
        error: 'Bad request',
        message: 'Message cannot be empty',
      });
      return;
    }

    // Validate conversation history
    if (!Array.isArray(conversationHistory)) {
      res.status(400).json({
        error: 'Bad request',
        message: 'conversationHistory must be an array',
      });
      return;
    }

    // Build user message content with images if provided
    let userContent: string | any[];
    if (images && images.length > 0) {
      userContent = [
        ...images.map((img) => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType,
            data: img.data,
          },
        })),
        {
          type: 'text',
          text: message,
        },
      ];
    } else {
      userContent = message;
    }

    // Build messages array
    const messages: Message[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: userContent,
      },
    ];

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx

    // Get streaming response from Claude
    const stream = await streamMessage(messages, systemPrompt);

    // Send model info first
    res.write(`data: ${JSON.stringify({ type: 'model', model: getModel() })}\n\n`);

    // Stream the response
    stream.on('text', (text: string) => {
      res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
    });

    stream.on('error', (error: Error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    });

    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      stream.abort();
    });

  } catch (error) {
    console.error('Error in /api/chat/stream:', error);

    // Send error as SSE
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Failed to get response from Claude'
    })}\n\n`);
    res.end();
  }
});

export default router;
