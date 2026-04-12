import type { Category } from "./data/ai-tools";

interface PromptConfig {
  type: "text" | "image" | "video" | "audio" | "code" | "design";
  prefix: string;
  suffix: string;
  tone: Record<string, string>;
  length: Record<string, string>;
}

export const promptData: Record<string, PromptConfig> = {
  // ==========================================
  // [1] Text/LLM
  // ==========================================
  "ChatGPT": {
    type: "text",
    prefix: "다음 주제와 목적에 맞춰 가장 완벽한 결과물을 작성해 주세요.\n\n[목적]: ",
    suffix: "\n\n[출력 형식]\n마크다운(Markdown) 형식을 사용하여 가독성 좋게 구조화해 주세요.",
    tone: {
      "상관없음": "",
      "전문적인": "어조: 매우 공식적이고 논리적이며, 관련 분야의 전문 용어를 적절히 사용하여 신뢰감을 줄 것.",
      "친근한": "어조: 대화하듯 부드럽고 친근하며, 공감하는 태도로 작성할 것.",
      "분석적인": "어조: 논리적이고 데이터 기반으로 접근하며, 장단점이나 원인과 결과를 명확히 분류할 것.",
      "창의적인": "어조: 독창적이고 흥미를 유발할 수 있는 시각에서 비유를 활용해 작성할 것.",
      "직설적인": "어조: 불필요한 미사여구를 모두 제거하고 핵심 결론부터 간결하고 명확하게 전달할 것."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "분량 제한: 핵심만 요약하여 최대 3~4문장(또는 1문단) 이내로 가장 짧게 작성할 것.",
      "중간 (2~3문단)": "분량 제한: 서론, 본론, 결론의 구조를 갖춰 2~3문단 정도로 작성할 것.",
      "길게 (상세하게)": "분량 제한: 가능한 한 상세하게 분석하며, 구체적인 예시를 포함하여 아주 길게 작성할 것."
    }
  },
  "Claude": {
    type: "text",
    prefix: "<task>\n사용자가 요청한 다음 목적을 최고의 퀄리티로 수행하십시오.\n",
    suffix: "\n</task>\n\n지침을 철저히 확인하고, XML 태그를 활용해 분석 과정(<thinking>)과 최종 결과(<result>)를 명확히 분리하여 도출해 주세요.",
    tone: {
      "상관없음": "",
      "전문적인": "<tone>전문적이고 논리적인 비즈니스 톤</tone>",
      "친근한": "<tone>따뜻하고 이해하기 쉬운 멘토 같은 톤</tone>",
      "분석적인": "<tone>구조적이고 비판적인 분석가 톤</tone>",
      "창의적인": "<tone>창의적이고 독창적인 아이디어 발상가 톤</tone>",
      "직설적인": "<tone>감정을 배제한 사실 적시 중심의 톤</tone>"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "<length>매우 간결하게 핵심 요소만 추출</length>",
      "중간 (2~3문단)": "<length>표준적인 길이의 논리적 텍스트</length>",
      "길게 (상세하게)": "<length>모든 예외 사항과 디테일, 풍부한 사례를 포함해 최대한 상세하고 방대한 분량</length>"
    }
  },
  "Gemini": {
    type: "text",
    prefix: "구글의 최신 정보를 바탕으로 다음 목적에 맞는 답변을 생성해 주세요.\n\n주제: ",
    suffix: "\n\n요청을 충실히 따르고, 필요한 경우 출처나 데이터 기반의 팩트를 덧붙여 주세요.",
    tone: {
      "상관없음": "",
      "전문적인": "어조: 전문적, 객관적, 최신 정보 기반.",
      "친근한": "어조: 캐주얼하고 이해하기 쉬운 유튜버 스타일.",
      "분석적인": "어조: 다각도로 분석한 리포트 스타일.",
      "창의적인": "어조: 신선한 아이디어를 제안하는 브레인스토밍 스타일.",
      "직설적인": "어조: 단답형, 즉각적인 정보 전달."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "단순 요약, 3문장 이내.",
      "중간 (2~3문단)": "포인트별 3문단 내외 설명.",
      "길게 (상세하게)": "방대한 배경 지식과 세부 정보 통사적 정리."
    }
  },
  "Perplexity": {
    type: "text",
    prefix: "다음 내용에 대해 깊이 있게 리서치하고 정확한 답변을 도출해 줘.\n\n검색 목적: ",
    suffix: "\n\n반드시 신뢰할 수 있는 출처를 바탕으로 정리하고, 정보의 편향 없이 답변해 줘.",
    tone: {
      "상관없음": "",
      "전문적인": "학술 논문 수준의 전문적인 용어와 신뢰성 있는 어조.",
      "친근한": "누구나 이해할 수 있는 쉬운 백과사전식 설명.",
      "분석적인": "통계 및 팩트체크 기반의 중립적이고 비판적인 분석.",
      "창의적인": "다양한 관점과 최신 트렌드를 엮어내는 기사 스타일.",
      "직설적인": "질문에 대한 정확한 팩트만 즉시 대답할 것."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "단 1문단으로 명쾌하게 요약.",
      "중간 (2~3문단)": "핵심을 3가지 포인트로 나누어 중간 길이로 설명.",
      "길게 (상세하게)": "배경, 진화 과정, 상세 정보, 인용을 곁들여 포괄적으로 작성."
    }
  },
  "뤼튼 (Wrtn)": {
    type: "text",
    prefix: "한국어에 가장 자연스러운 형태로 다음 지시를 수행해 주시기 바랍니다.\n\n요청 내용: ",
    suffix: "\n\n결과물을 한국어 특유의 매끄러운 맥락으로 다듬어 주세요.",
    tone: {
      "상관없음": "",
      "전문적인": "비즈니스 이메일이나 보고서에 쓰기 적합한 정중한 존댓말.",
      "친근한": "블로그 이웃에게 친근하게 말하듯 부드럽고 다정한 존댓말.",
      "분석적인": "기획서 양식처럼 번호나 기호를 사용해 논리정연하게.",
      "창의적인": "카피라이팅처럼 눈을 사로잡는 재치있는 문장.",
      "직설적인": "군더더기 없는 '~이다/하다' 건조 문서체."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "3줄 요약.",
      "중간 (2~3문단)": "일반적인 블로그 포스트 길이의 내용 전개.",
      "길게 (상세하게)": "매우 길고 구체적인 가이드 북 수준의 깊이 있는 작성."
    }
  },
  "Notion AI": {
    type: "text",
    prefix: "Notion 문서 워크스페이스에 삽입될 콘텐츠입니다. 아래 주제로 초안을 작성하세요.\n\n주제: ",
    suffix: "\n\nNotion의 블록(헤딩, 인용구, 체크리스트, 구분선 등)을 적절히 혼합하여 최적의 문서로 구조화해 주세요.",
    tone: {
      "상관없음": "",
      "전문적인": "공식 사내 위키(Wiki) 등록용으로 적합한 포멀한 톤.",
      "친근한": "팀원들에게 공유하는 캐주얼한 업무 일지 톤.",
      "분석적인": "데이터 비교표와 불릿 포인트를 활용한 구조화 톤.",
      "창의적인": "브레인스토밍 회의록처럼 아이디어가 통통 튀고 유연한 톤.",
      "직설적인": "핵심만 찌르는 액션 아이템(Action Items) 중심의 톤."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "짧은 메모 수준.",
      "중간 (2~3문단)": "표준적인 페이지 하나를 채울 분량.",
      "길게 (상세하게)": "하위 페이지로 나눌법한 길고 방대한 기획서 및 매뉴얼 수준."
    }
  },

  // ==========================================
  // [2] Image
  // ==========================================
  "Midjourney": {
    type: "image",
    prefix: "/imagine prompt: ",
    suffix: " --v 6.0 --q 1 --style raw",
    tone: {
      "상관없음": "",
      "전문적인": ", photorealistic, masterpiece, high resolution photography, 8k, highly detailed, shot on 35mm lens, award-winning",
      "친근한": ", cute styling, soft ambient lighting, pastel color palette, heartwarming, children's book illustration, Ghibli style",
      "분석적인": ", infographic style, minimalist layout, vector art, flat design, clean white background, UI/UX concept",
      "창의적인": ", masterpiece, surrealism artwork, imaginative, deeply colorful, trending on artstation, unreal engine 5 render, cinematic lighting",
      "직설적인": ", raw unedited photo, candid shot, polaroid style, clear composition, simple subject"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": ", minimalist background, focus on subject",
      "중간 (2~3문단)": ", clear background, well balanced composition, volumetric lighting",
      "길게 (상세하게)": ", extreme intricate details, cinematic volumetric lighting, dynamic dramatic composition, stunning visual storytelling, ultra-hyper-detailed 16k, epic scale"
    }
  },
  "DALL-E 3": {
    type: "image",
    prefix: "Please generate an image perfectly matching the detailed description below:\n\nSubject & Prompt: ",
    suffix: "\n\nEnsure that no extra random elements are added, strict adherence to the exact descriptive requirements is mandatory.",
    tone: {
      "상관없음": "",
      "전문적인": "The mood must be photorealistic, professional, and visually accurate as if taken by a high-end DSLR camera.",
      "친근한": "Use a warm, joyful, and highly appealing art style, leaning towards cute digital painting or 3D Pixar animation rendering.",
      "분석적인": "Maintain a sleek, minimalist isometric or vector-art aesthetic, keeping the focus on clarity and structure.",
      "창의적인": "Adopt a wildly imaginative, surreal, and artistically daring approach to create a jaw-dropping conceptual piece.",
      "직설적인": "Render the subject straightforwardly, with plain lighting and zero exaggerated artistic flair."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "Keep the scene clean and uncluttered.",
      "중간 (2~3문단)": "Include relevant background details to comfortably establish the setting.",
      "길게 (상세하게)": "The entire canvas should be extremely rich with meticulously detailed background elements, complex lighting gradients, and highly developed textures."
    }
  },
  "Stable Diffusion": {
    type: "image",
    prefix: "(masterpiece, best quality:1.2), highres, extremely detailed, ",
    suffix: "\nNegative prompt: (worst quality, low quality:1.4), blurry, bad anatomy, bad proportions, bad hands, text, watermark",
    tone: {
      "상관없음": "",
      "전문적인": "professional photography, studio lighting, hyper-realistic, highly detailed skin/texture,",
      "친근한": "anime style, cute, soft lighting, glowing, beautiful coloring,",
      "분석적인": "flat color, vector illustration, white background, simple framing,",
      "창의적인": "concept art, intense fantasy, glowing magic aesthetic, ray tracing, complex rendering,",
      "직설적인": "raw photo, normal exposure, everyday candid camera,"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "simple background",
      "중간 (2~3문단)": "detailed background, cinematic light",
      "길게 (상세하게)": "complex background crowded with objects, volumetric dust, particle effects, deeply decorated environment"
    }
  },
  "Leonardo AI": {
    type: "image",
    prefix: "A highly stylized and gorgeous rendering of: ",
    suffix: ". Rendered in octane, unreal engine 5, 8k resolution, masterpiece.",
    tone: {
      "상관없음": "",
      "전문적인": "hyper realistic, highly detailed, dramatic studio lighting, 8k, professional photography",
      "친근한": "cute stylized 3D render, Pixar style, soft volumetric lighting, magical atmosphere",
      "분석적인": "clean geometric 3D render, conceptual visualization, white background, studio setup",
      "창의적인": "mind-bending surrealism, digital painting masterpiece, highly imaginative illustration, vivid colors",
      "직설적인": "flat digital illustration, clear borders, plain lighting, direct composition"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": ", isolated subject, blank backdrop",
      "중간 (2~3문단)": ", atmospheric background, detailed environment",
      "길게 (상세하게)": ", astonishing level of detail in the background, epic scale, complex cinematic composition, micro-details in textures"
    }
  },
  "Freepik AI": {
    type: "image",
    prefix: "Commercial stock image of ",
    suffix: ", high quality, premium asset, well-lit.",
    tone: {
      "상관없음": "",
      "전문적인": ", corporate stock photo style, sharp focus, professional lighting",
      "친근한": ", lifestyle stock photo, smiling, warm and bright lighting",
      "분석적인": ", abstract data background, tech business style, cool tones",
      "창의적인": ", creative agency aesthetic, modern trendy graphic design, vibrant colors",
      "직설적인": ", isolated object on white background, product photography"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "",
      "중간 (2~3문단)": ", high resolution, depth of field",
      "길게 (상세하게)": ", highly detailed intricate elements, premium top tier layout, flawless execution, perfect professional lighting"
    }
  },

  // ==========================================
  // [3] Video
  // ==========================================
  "Runway (Gen-2)": {
    type: "video",
    prefix: "Cinematic motion video of ",
    suffix: ", smooth camera pan, 4k, 60fps",
    tone: {
      "상관없음": "",
      "전문적인": ", corporate commercial grade, professional studio lighting, hyper-realistic physics",
      "친근한": ", warm glow, smooth gentle movement, comforting animation",
      "분석적인": ", clean documentary shot, steady tripod cam, neutral lighting",
      "창의적인": ", mind-bending VFX transition, dynamic flow motion, visually striking abstract render",
      "직설적인": ", straightforward motion, realistic lighting, raw footage style"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": ", quick fast action transition",
      "중간 (2~3문단)": ", slow panning establishing shot",
      "길게 (상세하게)": ", epic long continuous tracking shot, evolving scene with complex movements"
    }
  },
  "Pika": {
    type: "video",
    prefix: "Animation of ",
    suffix: " -ar 16:9 -motion 2",
    tone: {
      "상관없음": "",
      "전문적인": ", highly detailed CGI, 8k crisp motion",
      "친근한": ", cute 3D animation, soft lighting, dynamic",
      "분석적인": ", flat vector animation, steady shot",
      "창의적인": ", anime style, gorgeous fluid motion, particle effects",
      "직설적인": ", realistic motion, standard camera"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": ", fast zoom",
      "중간 (2~3문단)": ", cinematic slow motion",
      "길게 (상세하게)": ", continuous smooth flowing action scene"
    }
  },
  "Haiper": {
    type: "video",
    prefix: "[Dynamic Shot] ",
    suffix: ". Hyper-realistic motion.",
    tone: {
      "상관없음": "",
      "전문적인": " Shot in 8k, professional cinematic camera, sharp focus.",
      "친근한": " Cozy and vivid, happy vibes, smooth transition.",
      "분석적인": " Steady drone shot, symmetrical focus.",
      "창의적인": " Mind-blowing visual effects, extreme dynamic angles.",
      "직설적인": " Raw steady shot, natural motion."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": " Quick pace.",
      "중간 (2~3문단)": " Cinematic pacing, gradual reveal.",
      "길게 (상세하게)": " Long ongoing epic camera journey."
    }
  },
  "Luma Dream Machine": {
    type: "video",
    prefix: "A highly realistic video sequence: ",
    suffix: ". Award-winning cinematography, hyper-detailed.",
    tone: {
      "상관없음": "",
      "전문적인": " Commercial quality, dramatic lighting, sharp depth of field.",
      "친근한": " Bright, optimistic, pastel lighting.",
      "분석적인": " Minimalist motion, strictly stable camera.",
      "창의적인": " Surreal physics, artistic transition, extreme lighting.",
      "직설적인": " Natural lighting, mundane movement."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": " Instant action.",
      "중간 (2~3문단)": " Wide establishing shot.",
      "길게 (상세하게)": " Continuous shot, highly complex scene development."
    }
  },
  "Sora": {
    type: "video",
    prefix: "A photorealistic and physically accurate video: ",
    suffix: ". Masterpiece, perfectly coherent physics, 8k resolution.",
    tone: {
      "상관없음": "",
      "전문적인": " Cinematic 35mm lens, professional lighting setup.",
      "친근한": " Warm golden hour lighting, peaceful movement.",
      "분석적인": " Documentary style footage, wide angle, grounded.",
      "창의적인": " Breathtaking fantasy environment, fluid dynamics, vibrant.",
      "직설적인": " Smartphone footage style, unedited, candid."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": " Rapid sequence.",
      "중간 (2~3문단)": " Smooth dynamic pan.",
      "길게 (상세하게)": " One uninterrupted epic take, flawless spatial consistency over a long duration."
    }
  },

  // ==========================================
  // [4] Audio/Music
  // ==========================================
  "Suno": {
    type: "audio",
    prefix: "[Style: ",
    suffix: "]\n\n[Lyrics/Prompt]:\n",
    tone: {
      "상관없음": "Pop",
      "전문적인": "Corporate background instrumental, clean, uplifting",
      "친근한": "Acoustic indie pop, warm rhythm, bright melody",
      "분석적인": "Minimalist electronic ambient, steady pulse",
      "창의적인": "Experimental synthwave mix, unique and unpredictable beat",
      "직설적인": "Hard rock, driving bass, high energy"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "\n[Focus]: Generate a very catchy 30-second chorus.",
      "중간 (2~3문단)": "\n[Structure]: Standard layout with 1 Verse and 1 Chorus.",
      "길게 (상세하게)": "\n[Structure]: Full song arrangement [Intro] -> [Verse 1] -> [Pre-Chorus] -> [Chorus] -> [Verse 2] -> [Bridge] -> [Outro]."
    }
  },
  "Udio": {
    type: "audio",
    prefix: "/genre: ",
    suffix: " \n\n[Theme]: ",
    tone: {
      "상관없음": "Pop music",
      "전문적인": "Cinematic orchestral, background music, highly polished",
      "친근한": "Lo-fi chill beats, relaxing, warm",
      "분석적인": "Techno, repetitive, analytical beat",
      "창의적인": "Avant-garde electronic, experimental fusion",
      "직설적인": "Punk rock, fast paced, aggressive"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": " (Focus on a short viral hook)",
      "중간 (2~3문단)": " (Radio edit structure)",
      "길게 (상세하게)": " (Extended mix with long instrumental breaks)"
    }
  },
  "ElevenLabs": {
    type: "audio",
    prefix: "[Voice Setting: ",
    suffix: "]\n\n[Script to Read]:\n",
    tone: {
      "상관없음": "Neutral",
      "전문적인": "Professional narration, deep voice, formal pace",
      "친근한": "Warm conversational, smiling voice, friendly tone",
      "분석적인": "Clear educational tone, precise pronunciation",
      "창의적인": "Dramatic voice acting, highly expressive, emotional",
      "직설적인": "Direct, flat delivery, deadpan"
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": " [Keep pace slightly faster for a 15-second spot.]",
      "중간 (2~3문단)": " [Pace naturally for a 1-minute read.]",
      "길게 (상세하게)": " [Take pauses effectively for a long audiobook narration.]"
    }
  },

  // ==========================================
  // [5] Code/Productivity
  // ==========================================
  "GitHub Copilot": {
    type: "code",
    prefix: "/* \n[Goal]: ",
    suffix: "\n*/\n\n// Generate the requested code below.",
    tone: {
      "상관없음": "",
      "전문적인": "Strict typing, robust error handling, best practices, well-documented.",
      "친근한": "Include gentle, easy-to-understand comments explaining each step for beginners.",
      "분석적인": "Focus on high performance, Big-O complexity comments, and comprehensive edge-case checks.",
      "창의적인": "Provide a clever, modern, and highly optimized alternative approach.",
      "직설적인": "No boilerplate, no excessive comments, just raw functional implementation."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "Only output the core function snippet.",
      "중간 (2~3문단)": "Output the implementation with basic interfaces and one usage example.",
      "길게 (상세하게)": "Build an entire modular architecture including mock data, test cases, and a class/struct implementation."
    }
  },
  "Gamma": {
    type: "design",
    prefix: "다음 주제로 Gamma AI 슬라이드 프레젠테이션 생성을 위한 완벽한 아웃라인을 작성해 줘.\n\n[주제]: ",
    suffix: "\n\n[요구 사항]\n각 슬라이드별로 [제목], [본문 핵심 요약], [자동 매칭을 위한 이미지 키워드]를 구조화해서 마크다운으로 뱉어줄 것.",
    tone: {
      "상관없음": "",
      "전문적인": "IR 피칭, B2B 제안서에 적합한 데이터 위주의 진지하고 포멀한 디자인 유도.",
      "친근한": "워크숍, 사내 세미나에 적합한 이모지와 재기발랄한 카피 중심의 디자인 유도.",
      "분석적인": "원인과 결과, 차트, 체크리스트를 활용한 학술 보고서 스타일.",
      "창의적인": "강렬한 대비와 매거진 스타일의 파격적인 레이아웃 및 카피라이팅 유도.",
      "직설적인": "스티브 잡스 스타일. 한 슬라이드에 1개의 큰 단어 또는 이미지만 배치하는 극한의 미니멀리즘."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "총 3~5장 내외의 엘리베이터 피치(Elevator Pitch) 아웃라인.",
      "중간 (2~3문단)": "총 8~12장 내외의 표준적인 서론본론결론 프레젠테이션 아웃라인.",
      "길게 (상세하게)": "총 20장 이상의 대규모 세션/강의 분량으로 목차를 촘촘히 쪼갠 아웃라인."
    }
  },
  "Canva AI": {
    type: "design",
    prefix: "Canva Magic Studio 또는 텍스트 기반 디자인 기획을 위한 프롬프트입니다.\n\n[디자인 목적]: ",
    suffix: "\n\n디자인에 들어갈 '메인 카피', '서브 카피', '추천 에셋(일러스트/사진) 스타일'을 뽑아주세요.",
    tone: {
      "상관없음": "",
      "전문적인": "신뢰감을 주는 Corporate Blue 톤, 고해상도 비즈니스 스톡 사진 사용 권장.",
      "친근한": "파스텔톤 및 둥근 폰트 텍스트, 아기자기한 벡터 일러스트 요소 활용 권장.",
      "분석적인": "단색 배경, 인포그래픽, 정제된 폰트와 도형 위주의 레이아웃 권장.",
      "창의적인": "네온 컬러, 그라데이션, 스크랩북 스타일 등 인스타그램 트렌드 요소 듬뿍 반영.",
      "직설적인": "굵은 고딕 폰트 텍스트 중심, 강렬한 보색 대비, 심플한 흰색 바탕."
    },
    length: {
      "상관없음": "",
      "짧게 (1문단)": "인스타그램 썸네일(1장) 수준의 정보량.",
      "중간 (2~3문단)": "카드뉴스(5장 내외) 포맷의 정보 전개.",
      "길게 (상세하게)": "대형 인포그래픽 또는 랜딩페이지용으로 긴 시퀀스를 갖는 요소 정리."
    }
  }
};

/**
 * AI 핸들러 무과금 프롬프트 자동 조립 엔진
 * @param {string} aiName - 선택한 AI 툴 이름
 * @param {string} category - 범주 (Fallback용이나 현재 마스터 프롬프트에선 거의 aiName 직매핑 활용)
 * @param {string} purpose - 목적 텍스트
 * @param {string} tone - 어조
 * @param {string} length - 길이
 * @returns {string} 완성된 프롬프트 조각
 */
export function generatePrompt(aiName: string, category: Category | string, purpose: string, tone: string, length: string) {
  // 등록된 22개 툴 중에서 찾고, 없으면 텍스트(ChatGPT)를 Fallback으로 잡습니다.
  let modelConfig = promptData[aiName];
  if (!modelConfig) {
      if (category === "이미지") modelConfig = promptData["Midjourney"];
      else if (category === "비디오") modelConfig = promptData["Runway (Gen-2)"];
      else if (category === "오디오/음악") modelConfig = promptData["Suno"];
      else modelConfig = promptData["ChatGPT"];
  }

  const { type, prefix, suffix, tone: toneMap, length: lengthMap } = modelConfig;

  // 빈 문자열 대응
  const selectedTone = toneMap[tone] || "";
  const selectedLength = lengthMap[length] || "";

  let finalPrompt = "";

  // type에 따른 구조화 로직 조립
  switch(type) {
    case "text":
    case "design":
      finalPrompt = `${prefix}${purpose}\n\n[추가 지시사항]\n${selectedTone}\n${selectedLength}${suffix}`;
      break;
    case "image":
    case "video":
      finalPrompt = `${prefix}${purpose}${selectedTone}${selectedLength}${suffix}`;
      break;
    case "audio":
      finalPrompt = `${prefix}${selectedTone}${suffix}${purpose}${selectedLength}`;
      break;
    case "code":
      finalPrompt = `${prefix}${purpose}\n${selectedTone}\n${selectedLength}${suffix}`;
      break;
    default:
      finalPrompt = `${prefix}${purpose}\n${selectedTone}\n${selectedLength}${suffix}`;
  }

  // 중복 쉼표 및 3줄 이상 연속 줄바꿈 정규식(Regex) 클리닝
  return finalPrompt
    .replace(/\n{3,}/g, '\n\n')
    .replace(/,{2,}/g, ',')
    .replace(/,(\s*,)+/g, ',') // ', ,' 같은 공백 포함 중복 콤마 처리
    .trim();
}
