---
category:
  - "[[Tech]]"
  - "[[Publish]]"
tags:
  - reading
  - python
date: 2025-06-27
draft: false
---
이 코드는 [[독서 기록 파싱 code]]로 산출한 csv파일을 분석하기 위한 코드이다. 이에 따라 [[독서 기록 분석 결과(2025년 6월 기준)]]을 작성하였다.

```python
import pandas as pd
from collections import Counter # Counter 클래스를 사용하기 위해 collections 모듈에서 임포트합니다.
import matplotlib.pyplot as plt # 시각화를 위해 matplotlib를 임포트합니다.

# CSV 파일 로드 (이전에 생성된 book_list.csv를 사용)
try:
    df = pd.read_csv('book_list.csv', encoding='utf-8-sig')
    print("CSV 파일을 성공적으로 로드했습니다.")
    # 'Rating' 컬럼이 숫자형인지 확인하고, 필요한 경우 변환 (예: 2.5를 2.5로 인식하도록)
    df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
    print(df.head())
except FileNotFoundError:
    print("book_list.csv 파일을 찾을 수 없습니다. 파일 경로를 확인해주세요.")
    exit()

# ---------------- Genre별 Rating 분석 ---------------

# Rating이 없는 경우를 고려하여 필터링
df_rated = df[df['Rating'].notna()]

print("\n--- Genre별 Rating이 가장 높은 도서 (상위 3권) ---")
print("\n각 Genre별 Rating이 가장 높은 도서 상위 3권:")
# 각 Genre별로 Rating이 높은 순서대로 정렬
df_rated_sorted_by_genre = df_rated.sort_values(by=['Genre', 'Rating'], ascending=[True, False])

# 각 Genre 그룹에서 상위 3개만 선택
top_3_per_genre = df_rated_sorted_by_genre.groupby('Genre').head(3)

for genre in top_3_per_genre['Genre'].unique():
    print(f"\n--- Genre: {genre} ---")
    genre_books = top_3_per_genre[top_3_per_genre['Genre'] == genre]
    for index, row in genre_books.iterrows():
        print(f"- '{row['Title']}' (Rating: {row['Rating']})")

# ---------------- 전체 도서 Rating 분석 ---------------

print("\n--- 전체 도서 중 Rating이 가장 높은 도서 (상위 10권) ---")
top_10_overall = df_rated.sort_values(by='Rating', ascending=False).head(10)

print("\n전체 도서 중 Rating이 가장 높은 도서 10권:")
for index, row in top_10_overall.iterrows():
    print(f"- '{row['Title']}' (Genre: {row['Genre']}, Rating: {row['Rating']})")

# --- 가장 많이 언급된 상위 3명의 Author (저자) ---
print("\n--- 가장 많이 언급된 상위 3명의 Author ---")

# Author 열의 각 값(문자열)을 공백 제거 후 카운트
author_counts = df['Author'].value_counts()
top_3_authors = author_counts.head(3)

print("상위 3명의 저자:")
for author, count in top_3_authors.items():
    print(f"- {author}: {count}권")

# --- 가장 많이 언급된 상위 3개의 Tag (태그) ---
print("\n--- 가장 많이 언급된 상위 3개의 Tag ---")

# 모든 태그를 담을 리스트 초기화
all_tags = []

# Tags 열을 순회하며 콤마로 구분된 태그를 분리하고 리스트에 추가
# NaN 값(태그가 없는 경우)은 처리하지 않도록 합니다.
for tags_str in df['Tags'].dropna():
    # 문자열 앞뒤 공백 제거 후 콤마로 분리, 각 태그도 공백 제거
    current_tags = [tag.strip() for tag in tags_str.split(',')]
    all_tags.extend(current_tags)

# 태그들의 언급 횟수 계산
tag_counts = Counter(all_tags)

# 상위 3개의 태그 추출
top_3_tags = tag_counts.most_common(3)

print("상위 3개의 태그:")
for tag, count in top_3_tags:
    print(f"- {tag}: {count}회 언급")

# ---------------- 연도별 독서량 계산 -----------------------
    
# 'Read Date' 열을 날짜 형식으로 변환
df['Read Date'] = pd.to_datetime(df['Read Date'])
df['Read Year'] = df['Read Date'].dt.year

# 연도별 독서량 계산
books_per_year = df['Read Year'].value_counts().sort_index()

print("\n--- 연도별 나의 독서량 ---")
print(books_per_year)

# 시각화
plt.figure(figsize=(10, 6))
books_per_year.plot(kind='bar')
plt.title('My Reading Volume per Year')
plt.xlabel('Year')
plt.ylabel('Number of Books Read')
plt.xticks(rotation=45)
plt.grid(axis='y', linestyle='--')
plt.tight_layout()
plt.show()
```
