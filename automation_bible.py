import os
import json
import random
import requests
from openai import OpenAI

BIBLE_VERSES_DATABASE = {
    "위로와 평안": [
        {
            "passage": "이사야 41:10",
            "text": "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 세시게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라"
        },
        {
            "passage": "요한복음 14:27",
            "text": "평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것과 같지 아니하니라 너희는 마음에 근심하지도 말고 두려워하지도 말라"
        },
        {
            "passage": "시편 23:1-3",
            "text": "여호와는 나의 목자시니 내게 부족함이 없으리로다 그가 나를 푸른 밭에 누이시며 쉬만 한 물 가로 인도하시는도다 내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다"
        },
        {
            "passage": "마태복음 11:28",
            "text": "수고하고 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라"
        }
    ],
    "소망과 용기": [
        {
            "passage": "예레미야 29:11",
            "text": "여호와의 말씀이니라 너희를 향한 나의 생각을 내가 아나니 평안이요 재앙이 아니니라 너희에게 미래와 희망을 주는 것이니라"
        },
        {
            "passage": "로마서 8:28",
            "text": "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라"
        },
        {
            "passage": "빌립보서 4:13",
            "text": "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라"
        },
        {
            "passage": "여호수아 1:9",
            "text": "내가 네게 명령한 것이 아니냐 강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라"
        }
    ],
    "감사와 기쁨": [
        {
            "passage": "데살로니가전서 5:16-18",
            "text": "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라"
        },
        {
            "passage": "시편 107:1",
            "text": "여호와께 감사하라 그는 선하시며 그 인자하심이 영원함이로다"
        },
        {
            "passage": "빌립보서 4:6-7",
            "text": "아무 것도 근심하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라 그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라"
        }
    ],
    "지혜와 인도": [
        {
            "passage": "잠언 3:5-6",
            "text": "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라"
        },
        {
            "passage": "시편 119:105",
            "text": "주의 말씀은 내 발에 등이요 내 길에 빛이니이다"
        },
        {
            "passage": "야고보서 1:5",
            "text": "너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라 그리하면 주시리라"
        }
    ]
}

class BibleMeditationGenerator:
    def __init__(self):
        api_key = os.environ.get("OPENAI_API_KEY")
        self.client = OpenAI(api_key=api_key) if api_key and api_key != "mock_key" else None

    def get_categories(self):
        return list(BIBLE_VERSES_DATABASE.keys())

    def get_verses_by_category(self, category):
        return BIBLE_VERSES_DATABASE.get(category, BIBLE_VERSES_DATABASE["위로와 평안"])

    def generate_meditation(self, category="위로와 평안", tone="은혜로운 묵상체", specific_passage=None):
        verses = self.get_verses_by_category(category)
        
        if specific_passage:
            selected = next((v for v in verses if v["passage"] == specific_passage), random.choice(verses))
        else:
            selected = random.choice(verses)
            
        passage = selected["passage"]
        text = selected["text"]

        if self.client:
            try:
                prompt = f"""
당신은 은혜롭고 따뜻한 성경 묵상 칼럼니스트입니다.
티스토리 블로그에 포스팅할 묵상 글을 작성해주세요.

- 성경 구절: {passage} ({text})
- 주제 카테고리: {category}
- 작성 어투: {tone}

JSON 형식으로 응답해주세요:
{{
  "title": "티스토리 블로그 포스팅 제목 (감성적이고 유입률 높은 제목)",
  "meditation": "성경 본문의 깊은 의미와 현대 삶에서의 적용을 다룬 묵상 글 (3~4개 단락)",
  "prayer": "오늘 하루를 위한 고백과 결단의 마무리 기도문",
  "tags": "성경말씀,오늘의묵상,{category.replace(' ', '')},말씀카드,기독교블로그,티스토리묵상"
}}
"""
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}
                )
                res_data = json.loads(response.choices[0].message.content)
                title = res_data.get("title", f"✨ [{passage}] 세상을 이기는 은혜와 평안의 말씀 묵상")
                meditation = res_data.get("meditation", "")
                prayer = res_data.get("prayer", "")
                tags = res_data.get("tags", "성경말씀,오늘의묵상,기독교,티스토리")
            except Exception as e:
                print(f"OpenAI API 예외 발생: {e}. 스마트 내장 묵상 엔진으로 전환합니다.")
                title, meditation, prayer, tags = self._fallback_generate(passage, text, category, tone)
        else:
            title, meditation, prayer, tags = self._fallback_generate(passage, text, category, tone)

        # 티스토리 블로그 HTML 호환 템플릿 생성
        full_content = f"""<div style="font-family: 'Noto Serif KR', serif; line-height: 1.8; color: #2d3748; max-width: 720px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #744210 0%, #b7791f 100%); color: #ffffff; padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(116, 66, 16, 0.15);">
    <span style="font-size: 12px; letter-spacing: 1px; text-transform: uppercase; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px;">📖 {category}</span>
    <h2 style="font-size: 22px; font-weight: bold; margin-top: 12px; margin-bottom: 0; color: #ffffff;">{passage}</h2>
    <p style="font-size: 15px; font-style: italic; margin-top: 8px; opacity: 0.95; line-height: 1.6;">"{text}"</p>
  </div>

  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

  <h3 style="font-size: 18px; color: #744210; font-weight: bold; margin-bottom: 16px;">🌿 말씀 묵상과 생각하기</h3>
  <div style="font-size: 15px; color: #4a5568; white-space: pre-line; margin-bottom: 28px;">
{meditation}
  </div>

  <div style="background-color: #fefcbf; border-left: 4px solid #d69e2e; padding: 18px 20px; border-radius: 8px; margin-bottom: 28px;">
    <h4 style="font-size: 15px; font-weight: bold; color: #744210; margin-top: 0; margin-bottom: 8px;">🙏 오늘의 기도</h4>
    <p style="font-size: 14px; color: #744210; margin: 0; font-style: italic;">{prayer}</p>
  </div>

  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

  <div style="font-size: 13px; color: #a0aec0; font-weight: 500;">
    🏷️ <b>태그:</b> {tags}
  </div>
</div>"""

        return {
            "passage": passage,
            "verse_text": text,
            "title": title,
            "meditation": meditation,
            "prayer": prayer,
            "tags": tags,
            "full_content": full_content,
            "category": category,
            "tone": tone
        }

    def _fallback_generate(self, passage, text, category, tone):
        title = f"✨ [{passage}] 세상을 이기는 은혜와 평안의 말씀 묵상"
        meditation = f"""바쁜 일상과 치열한 삶의 순간 속에서 때로는 마음의 조급함과 염려가 찾아오곤 합니다. 
하지만 주님께서는 오늘 {passage} 말씀("{text}")을 통해 우리에게 가장 확실한 약속과 평안을 건네주십니다.

하나님의 사랑은 우리의 환경이나 조건에 따라 변하지 않는 영원한 신실함입니다. 
우리가 스스로의 힘으로 견디기 힘든 순간에도, 주님께서는 변함없이 곁에서 함께하시며 힘을 주시고 인도하십니다. 
오늘 하루, 내 명철을 내려놓고 주님의 의로운 손길을 온전히 의지할 때 비로소 진정한 자유와 쉼을 누릴 수 있습니다."""

        prayer = f"""사랑과 은혜가 풍성하신 하나님 아버지,
오늘도 {passage} 말씀을 통해 삶의 지혜와 평안을 주시니 감사합니다. 
우리의 마음 속 두려움과 근심을 내려놓고 주님의 신실한 약속만을 붙들게 하소서.
예수님의 이름으로 기도드립니다. 아멘."""

        tags = f"성경말씀,{passage.replace(' ', '')},오늘의묵상,성경구절,{category.replace(' ', '')},티스토리묵상"
        return title, meditation, prayer, tags

    def post_to_tistory_api(self, access_token, blog_name, title, content, category_id="0", tag_string=""):
        """
        티스토리 OpenAPI 글 쓰기 (https://www.tistory.com/guide/api/post/write)
        """
        url = "https://www.tistory.com/apis/post/write"
        params = {
            "access_token": access_token,
            "output": "json",
            "blogName": blog_name,
            "title": title,
            "content": content,
            "visibility": "3",  # 3: 발행 (공개), 0: 비공개
            "category": category_id,
            "tag": tag_string
        }
        try:
            res = requests.post(url, data=params, timeout=10)
            data = res.json()
            if data.get("tistory", {}).get("status") == "200":
                post_id = data["tistory"].get("postId")
                url = data["tistory"].get("url")
                print(f"티스토리 포스팅 성공: ID {post_id}, URL {url}")
                return True, url
            else:
                err_msg = data.get("tistory", {}).get("errMsg", "알 수 없는 오류")
                print(f"티스토리 API 연동 실패: {err_msg}")
                return False, err_msg
        except Exception as e:
            print(f"티스토리 API 통신 예외: {e}")
            return False, str(e)
