import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const XAI_MODEL_MAP = {
  'grok-2': 'grok-2-1212',
  'grok-1.5': 'grok-1.5-llm', 
  'grok-1.0': 'grok-1.0-llm', 
  'grok-3': 'grok-3-mini-beta', 
  'grok-2-vision': 'grok-2-image', 
};

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'grok-2': chatModel,
        'grok-1.5': chatModel,
        'grok-1.0': chatModel,
        'grok-3': chatModel,
        'grok-2-vision': chatModel,
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'grok-2': xai(XAI_MODEL_MAP['grok-2']),
        'grok-1.5': xai(XAI_MODEL_MAP['grok-1.5']),
        'grok-1.0': xai(XAI_MODEL_MAP['grok-1.0']),
        'grok-3': xai(XAI_MODEL_MAP['grok-3']),
        'grok-2-vision': xai(XAI_MODEL_MAP['grok-2-vision']),
        'chat-model': xai('grok-2-1212'), 
        'chat-model-reasoning': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });
