from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from urllib.parse import urlparse, parse_qs
import time
import os
import json

# 크롬드라이버 경로 설정(같은 폴더에 chromedriver.exe 있어야 함)
driver_path = os.path.join(os.getcwd(), 'chromedriver.exe')

# 크롬 옵션 설정
options = Options()
options.add_argument('--headless') # 브라우저 창 띄우지 않기
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')

# 크롬 드라이버 실행(selenium에서 크롬브라우저 실행함)
service = Service(driver_path)
driver = webdriver.Chrome(service=service, options=options)

# 유튜브 재생목록 열기
url = 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn6jXS_Tv_N9B8Z0HTRVJE0m'
driver.get(url)

# 페이지 로딩 대기
time.sleep(3) 

# 페이지 정보 가져오기(셀레니움으로 파싱)
videos = driver.find_elements(By.CSS_SELECTOR, "ytd-playlist-video-renderer")

results = []

for idx, video in enumerate(videos[:100], start=1):
  try:
    # 제목/URL 추출
    title_el = video.find_element(By.ID, "video-title")
    title = title_el.text
    video_url = title_el.get_attribute("href")
    
    # video_id 추출
    parsed_url = urlparse(video_url)
    video_id = parse_qs(parsed_url.query)['v'][0]
    
    # 썸네일 추출
    thumbnail = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    
    # 채널명/조회수/업로드일 추출
    metadata_block = video.find_element(By.CSS_SELECTOR, "#meta").text
    metadata_parts = [part.strip() for part in metadata_block.split("·")]
    
    channel = metadata_parts[0] if len(metadata_parts) > 0 else ""
    views = metadata_parts[1] if len(metadata_parts) > 1 else ""
    uploaded = metadata_parts[2] if len(metadata_parts) > 2 else ""
    
    results.append({
      "id": idx,
      "title": title,
      "channel": channel,
      "views": views,
      "uploaded": uploaded,
      "youtubeUrl": video_url,
      "thumbnail": thumbnail
    })
    
  except Exception as e:
    print(f"{idx}번 영상 크롤링 실패:", e)
    
driver.quit()

# json 저장 경로 설정
save_path="../backend/data/youtube_top100.json"

with open(save_path, "w", encoding="utf-8") as f:
  json.dump(results, f, ensure_ascii=False, indent=2)
  
print("JSON 저장 완료: youtube_top100.json")

# 결과 확인
for item in results:
  print(item)