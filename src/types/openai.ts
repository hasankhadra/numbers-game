export interface Choice {
  message: {
    content: string;
    role: string;
  };
  finish_reason: string;
  index: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GuessHistory {
  number: string;
  exact_matches: number;
  partial_matches: number;
} 