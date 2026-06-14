"""Claude API integration for tarot interpretation."""

import json
import logging
import os
from anthropic import AsyncAnthropic


logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """你是一位经验丰富、富有同理心的塔罗牌解读师。你的解读风格兼具深度与温暖，像一位智慧的朋友在对话。

解读原则：
1. 关注心理洞察与内在成长，而非神秘学式的预言
2. 强调自由意志与个人能动性——塔罗牌提供的是洞察而非注定的命运
3. 将每张牌的含义与它在牌阵中的位置结合，理解上下文
4. 将多张牌串联成一个连贯的叙事，而非孤立解读每一张
5. 语言温暖、平实，避免过于玄奥难懂的术语

请以 JSON 格式返回你的解读。"""


def build_interpretation_prompt(
    question: str,
    spread: dict,
    drawn_cards: list[dict],
    cards_map: dict[str, dict],
) -> str:
    """Build the Claude prompt for a tarot interpretation."""
    sorted_cards = sorted(drawn_cards, key=lambda d: d["position_index"])

    cards_text = ""
    for dc in sorted_cards:
        card = cards_map[dc["card_id"]]
        pos = spread["positions"][dc["position_index"]]
        orientation = "逆位" if dc["reversed"] else "正位"
        keywords = card["keywords_reversed"] if dc["reversed"] else card["keywords_upright"]
        cards_text += f"""
位置「{pos['label']}」— {orientation}
牌名：{card['name_zh']} ({card['name_en']})
关键词：{'、'.join(keywords)}
牌面简述：{card['description']}
"""

    positions_text = ""
    for pos in spread["positions"]:
        positions_text += f"- {pos['label']}：{pos['meaning']}\n"

    prompt = f"""用户的问题：「{question}」

使用的牌阵：{spread['name_zh']}
牌阵说明：
{positions_text}
抽取的牌：
{cards_text}
请将以上牌串联起来，给出一个温暖而有洞察力的整体解读。输出格式如下（严格 JSON）：

{{
  "narrative": "整体叙事——将各张牌串联成一个连贯的故事，指出牌与牌之间的关联、因果和能量流动。300-500字。",
  "individual": [
    {{
      "position": "位置名称",
      "reading": "该位置牌的单张解读，结合位置含义和正逆位。100-200字。"
    }}
  ],
  "guidance": {{
    "key_points": ["3-5条关键指引"],
    "cautions": ["2-3条需要注意的事项"]
  }}
}}"""

    return prompt


def _extract_json(response_text: str) -> str:
    """Extract JSON string from Claude response, handling markdown code fences."""
    json_start = response_text.find("```json")
    if json_start != -1:
        start = json_start + 7
        end = response_text.find("```", start)
        if end == -1:
            raise ValueError("Malformed Claude response: unclosed JSON code block")
        return response_text[start:end].strip()

    code_start = response_text.find("```")
    if code_start != -1:
        end = response_text.find("```", code_start + 3)
        if end != -1:
            return response_text[code_start + 3:end].strip()

    return response_text.strip()


def _validate_interpretation_result(result: dict) -> None:
    """Validate that the parsed JSON has the required structure."""
    if not isinstance(result, dict):
        raise ValueError("Claude response is not a JSON object")
    for key in ("narrative", "individual", "guidance"):
        if key not in result:
            raise ValueError(f"Claude response missing required key: '{key}'")
    if not isinstance(result["individual"], list):
        raise ValueError("'individual' must be a list")
    if not isinstance(result["guidance"], dict):
        raise ValueError("'guidance' must be an object")


async def interpret_with_claude(
    question: str,
    spread: dict,
    drawn_cards: list[dict],
    cards_map: dict[str, dict],
    api_key: str | None = None,
) -> dict:
    """Send interpretation request to Claude API."""
    if api_key is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")

    client = AsyncAnthropic(api_key=api_key)
    prompt = build_interpretation_prompt(question, spread, drawn_cards, cards_map)

    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
        timeout=30.0,
    )

    response_text = message.content[0].text
    logger.info(
        "Claude API response received",
        extra={"response_length": len(response_text), "model": "claude-sonnet-4-6"},
    )

    json_text = _extract_json(response_text)

    try:
        result = json.loads(json_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Claude returned invalid JSON: {e}")

    _validate_interpretation_result(result)

    sorted_cards = sorted(drawn_cards, key=lambda d: d["position_index"])
    for i, dc in enumerate(sorted_cards):
        if i < len(result["individual"]):
            card = cards_map[dc["card_id"]]
            result["individual"][i]["card"] = card
            result["individual"][i]["reversed"] = dc["reversed"]

    return result
