
let internalVoices: SpeechSynthesisVoice[] = [];
let utteranceQueue: SpeechSynthesisUtterance[] = [];
let currentQueueIndex: number = -1;
let isQueuePlaying: boolean = false;
let globalOnEndCallback: (() => void) | null = null;
let globalOnErrorCallback: ((error: string) => void) | null = null;


const populateVoices = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    internalVoices = window.speechSynthesis.getVoices();
  }
};

if (typeof window !== 'undefined' && window.speechSynthesis) {
  populateVoices(); 
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
}

const mapLanguageToBcp47 = (language: string): string => {
  const langLower = language.toLowerCase().trim();
  
  if (langLower === "english" || langLower.startsWith("en")) return "en-US";
  if (langLower === "english (us)") return "en-US";
  if (langLower === "english (uk)" || langLower === "english (gb)") return "en-GB";
  if (langLower === "spanish" || langLower.startsWith("es")) return "es-ES";
  if (langLower === "spanish (spain)") return "es-ES";
  if (langLower === "spanish (mexico)") return "es-MX";
  if (langLower === "french" || langLower.startsWith("fr")) return "fr-FR";
  if (langLower === "french (france)") return "fr-FR";
  if (langLower === "french (canada)") return "fr-CA";
  if (langLower === "german" || langLower.startsWith("de")) return "de-DE";
  if (langLower === "japanese" || langLower.startsWith("ja")) return "ja-JP";
  if (langLower === "korean" || langLower.startsWith("ko")) return "ko-KR";
  if (langLower === "italian" || langLower.startsWith("it")) return "it-IT";
  if (langLower === "portuguese" || langLower.startsWith("pt")) return "pt-BR"; 
  if (langLower === "portuguese (portugal)") return "pt-PT";
  if (langLower === "portuguese (brazil)") return "pt-BR";
  if (langLower === "chinese" || langLower === "mandarin" || langLower.startsWith("zh")) return "zh-CN";

  if (/^[a-z]{2}(-[A-Z0-9]{2,4})?$/i.test(language)) {
    const parts = language.split('-');
    if (parts.length === 2) {
        return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }
    return parts[0].toLowerCase();
  }
  
  console.warn(`Unmapped language: "${language}", defaulting to en-US.`);
  return "en-US"; 
};

const handleSegmentError = (event: SpeechSynthesisErrorEvent) => {
  const errorType = event.error || 'Unknown error';
  const utteranceTextPreview = event.utterance?.text?.substring(0, 70) + '...';

  console.warn(`SpeechSynthesisUtterance event: Type: ${event.type}, Error: ${errorType}, Utterance: "${utteranceTextPreview}", Voice: ${event.utterance?.voice?.name}, Lang: ${event.utterance?.lang}`);

  const isExpectedCancellation = !isQueuePlaying && (errorType === 'canceled' || errorType === 'interrupted');

  if (!isExpectedCancellation) {
    globalOnErrorCallback?.(`Speech synthesis error: ${errorType}`);
  } else {
    console.info(`Error '${errorType}' on utterance "${utteranceTextPreview}" was an expected cancellation (likely due to stop() call). Not reporting to UI.`);
  }

  isQueuePlaying = false; 
  utteranceQueue = [];    
  currentQueueIndex = -1; 
  
  globalOnEndCallback = null;
  globalOnErrorCallback = null;
};


const playNextInQueue = () => {
  currentQueueIndex++;
  if (currentQueueIndex < utteranceQueue.length && isQueuePlaying) {
    const utteranceToPlay = utteranceQueue[currentQueueIndex];
    window.speechSynthesis.speak(utteranceToPlay);
  } else {
    if (isQueuePlaying) { 
      globalOnEndCallback?.();
    } else { 
      console.info("Speech queue processing finished or was externally stopped.");
    }
    isQueuePlaying = false; 
    utteranceQueue = [];
    currentQueueIndex = -1;
    globalOnEndCallback = null;
    globalOnErrorCallback = null;
  }
};

export const speak = async (
  content: string, 
  language: string,
  onEndCallback: () => void,
  onErrorCallback: (error: string) => void,
  selectedVoiceURI?: string | null 
): Promise<void> => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onErrorCallback("Speech synthesis is not supported in this browser.");
    return;
  }

  stop(); 

  globalOnEndCallback = onEndCallback;
  globalOnErrorCallback = onErrorCallback;

  const bcp47Lang = mapLanguageToBcp47(language);
  
  if (internalVoices.length === 0) {
      populateVoices();
  }

  if (!content || content.trim() === "") {
    isQueuePlaying = false; 
    globalOnEndCallback?.(); 
    globalOnEndCallback = null; 
    globalOnErrorCallback = null;
    return;
  }

  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = bcp47Lang;

  let chosenVoice: SpeechSynthesisVoice | undefined = undefined;

  if (selectedVoiceURI) {
    chosenVoice = internalVoices.find(v => v.voiceURI === selectedVoiceURI);
    if (!chosenVoice) {
      console.warn(`Selected voice URI "${selectedVoiceURI}" not found. Falling back to language-based selection.`);
    }
  }

  if (!chosenVoice) {
    chosenVoice = internalVoices.find(v => v.lang === bcp47Lang && v.localService);
    if (!chosenVoice) chosenVoice = internalVoices.find(v => v.lang.startsWith(bcp47Lang.split('-')[0]) && v.localService);
    if (!chosenVoice) chosenVoice = internalVoices.find(v => v.lang === bcp47Lang);
    if (!chosenVoice) chosenVoice = internalVoices.find(v => v.lang.startsWith(bcp47Lang.split('-')[0]));
  }
  
  if (chosenVoice) {
    utterance.voice = chosenVoice;
  } else {
    console.warn(`No suitable voice found for language ${language} (BCP47: ${bcp47Lang}) or selected URI. Using system default.`);
  }
  
  utterance.onend = () => {
    if (isQueuePlaying) { 
      playNextInQueue();
    } else { 
      console.info(`Utterance ended for "${content.substring(0,30)}..." but queue is no longer active.`);
      if (currentQueueIndex === utteranceQueue.length -1 || utteranceQueue.length === 0) {
          playNextInQueue();
      }
    }
  };
  utterance.onerror = handleSegmentError;
  utteranceQueue.push(utterance);


  if (utteranceQueue.length > 0) {
    isQueuePlaying = true; 
    currentQueueIndex = -1; 
    playNextInQueue();
  } else {
    isQueuePlaying = false; 
    globalOnEndCallback?.(); 
    globalOnEndCallback = null; 
    globalOnErrorCallback = null;
  }
};

export const testVoice = (
  voiceURI: string,
  text: string,
  lang: string, // Language of the voice/text
  onError: (error: string) => void
): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onError("Speech synthesis is not supported.");
    return;
  }
  
  stop(); // Stop any ongoing speech

  const voiceToTest = internalVoices.find(v => v.voiceURI === voiceURI);
  if (!voiceToTest) {
    onError(`Voice with URI "${voiceURI}" not found.`);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voiceToTest;
  utterance.lang = mapLanguageToBcp47(lang); // Use the voice's language, mapped
  
  utterance.onend = () => {
    // console.log("Test voice finished.");
  };
  utterance.onerror = (event) => {
    console.error("Test voice SpeechSynthesisErrorEvent:", event);
    onError(event.error || "Unknown error during test voice playback.");
  };

  window.speechSynthesis.speak(utterance);
};


export const stop = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    isQueuePlaying = false; 
    window.speechSynthesis.cancel(); 

    utteranceQueue = [];    
    currentQueueIndex = -1; 
    
    globalOnEndCallback = null;
    globalOnErrorCallback = null;
  }
};

export const pause = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis && isQueuePlaying) {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
       window.speechSynthesis.pause();
    }
  }
};

export const resume = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis && isQueuePlaying) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
};

export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  }
  return false;
};

export const isPaused = (): boolean => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.paused;
  }
  return false;
};

export const getAvailableVoices = (): { name: string, lang: string, default: boolean, voiceURI: string }[] => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const voicesFromBrowser = window.speechSynthesis.getVoices();
    if (voicesFromBrowser.length > 0 && (internalVoices.length === 0 || internalVoices.length !== voicesFromBrowser.length || !internalVoices.every((v,i) => v.voiceURI === voicesFromBrowser[i]?.voiceURI) ) ) {
      internalVoices = voicesFromBrowser; 
    }
    const sourceVoices = internalVoices.length > 0 ? internalVoices : voicesFromBrowser;

    return sourceVoices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      voiceURI: voice.voiceURI,
    }));
  }
  return [];
};

export const cleanupSpeech = (): void => {
  stop(); 
};
