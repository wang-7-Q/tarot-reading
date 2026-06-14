"""Keyword-based spread recommendation engine."""


KEYWORD_TAG_MAP = {
    "感情": ["感情", "关系"],
    "喜欢": ["感情", "关系"],
    "爱": ["感情", "关系"],
    "恋爱": ["感情", "关系"],
    "分手": ["感情", "关系"],
    "他": ["感情", "关系"],
    "她": ["感情", "关系"],
    "对象": ["感情", "关系"],
    "关系": ["感情", "关系"],
    "婚姻": ["感情", "关系"],
    "暗恋": ["感情", "关系"],
    "表白": ["感情", "关系"],

    "事业": ["事业", "选择"],
    "工作": ["事业", "选择"],
    "跳槽": ["事业", "选择"],
    "面试": ["事业", "选择"],
    "职业": ["事业", "选择"],
    "升职": ["事业", "选择"],
    "辞职": ["事业", "选择"],
    "老板": ["事业", "选择"],
    "同事": ["事业", "选择"],

    "财运": ["财运", "选择"],
    "投资": ["财运", "选择"],
    "钱": ["财运", "选择"],
    "财务": ["财运", "选择"],
    "经济": ["财运", "选择"],

    "人生": ["通用", "深度"],
    "迷茫": ["通用", "深度"],
    "方向": ["通用", "选择"],
    "未来": ["通用"],
    "选择": ["通用", "选择"],
    "决定": ["通用", "选择"],
    "怎么办": ["通用", "选择"],
}

DEFAULT_TAGS = ["通用"]


def recommend_spreads(question: str, spreads: list[dict]) -> list[dict]:
    """Analyze question keywords and return top 3 matching spreads."""
    if not question.strip():
        return _default_spreads(spreads)

    tag_scores: dict[str, int] = {}
    for keyword, tags in KEYWORD_TAG_MAP.items():
        if keyword in question:
            for tag in tags:
                tag_scores[tag] = tag_scores.get(tag, 0) + 1

    if not tag_scores:
        matched_tags = DEFAULT_TAGS
    else:
        matched_tags = sorted(tag_scores, key=tag_scores.get, reverse=True)

    scored = []
    for spread in spreads:
        score = 0
        for i, tag in enumerate(matched_tags):
            if tag in spread["tags"]:
                score += len(matched_tags) - i
        scored.append((score, spread))

    scored.sort(key=lambda x: (-x[0], x[1]["card_count"]))

    result = [s for _, s in scored if _ > 0 or len(scored) <= 3]
    if not result:
        result = _default_spreads(spreads)

    return result[:3]


def _default_spreads(spreads: list[dict]) -> list[dict]:
    """Return default spreads: three-card first, then single-card."""
    three_card = next((s for s in spreads if s["id"] == "three-card"), None)
    single_card = next((s for s in spreads if s["id"] == "single-card"), None)
    result = []
    if three_card:
        result.append(three_card)
    if single_card:
        result.append(single_card)
    if not result:
        result = spreads[:1]
    return result
