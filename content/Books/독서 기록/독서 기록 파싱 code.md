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
이 코드는 [[Book]] 카테고리 글들의 frontmatter 정보를 파싱하여 csv 파일로 저장하기 위한 코드이다. 

```python
import os
import pandas as pd
import re
import yaml

def parse_frontmatter(md_content):
    """
    Markdown content에서 frontmatter를 파싱합니다.
    """
    # ---로 시작하고 ---로 끝나는 frontmatter 블록을 찾습니다.
    match = re.match(r'---\s*(.*?)\s*---', md_content, re.DOTALL)
    if match:
        frontmatter_str = match.group(1)
        try:
            return yaml.safe_load(frontmatter_str)
        except yaml.YAMLError as e:
            print(f"Error parsing YAML frontmatter: {e}")
            return None
    return None

def process_markdown_files(folder_path):
    """
    지정된 폴더 내의 Markdown 파일들을 처리하여 DataFrame을 생성합니다.
    """
    data = []
    
    for filename in os.listdir(folder_path):
        if filename.endswith(".md"):
            filepath = os.path.join(folder_path, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                frontmatter = parse_frontmatter(content)
                
                if frontmatter:
                    # 데이터 정리 및 추출
                    row = {}
                    row['Title'] = frontmatter.get('title', '')
                    row['Subtitle'] = frontmatter.get('subtitle', '')
                    
                    # Author 처리 (리스트인 경우 첫 번째 값 사용)
                    author = frontmatter.get('author', [''])[0]
                    row['Author'] = author if isinstance(author, str) else ''
                    
                    # Genre 처리 (Obsidian link 형식 제거)
                    genre = frontmatter.get('genre', [''])[0]
                    row['Genre'] = genre.replace('[[', '').replace(']]', '') if isinstance(genre, str) else ''
                    
                    # Category 처리 (Obsidian link 형식 제거)
                    category = frontmatter.get('category', [''])[0]
                    row['Category'] = category.replace('[[', '').replace(']]', '') if isinstance(category, str) else ''
                    
                    row['Publisher'] = frontmatter.get('publisher', '')
                    
                    # Publish 날짜 처리: 리스트 또는 단일 값
                    publish_date = frontmatter.get('publish', '')
                    if isinstance(publish_date, list):
                        # 리스트의 첫 번째 값 사용 (예: [2022-07-25])
                        publish_date = publish_date[0] if publish_date else ''
                    row['Publish Year'] = str(publish_date).split('-')[0] if publish_date else '' # 연도만 추출
                    
                    row['Total Pages'] = frontmatter.get('total', '')
                    row['ISBN10'] = frontmatter.get('isbn10', '')
                    row['ISBN13'] = frontmatter.get('isbn13', '')
                    row['Cover URL'] = frontmatter.get('coverUrl', '')
                    row['Status'] = frontmatter.get('status', '')
                    row['Rating'] = frontmatter.get('rating', '')
                    
                    # Tags 처리: 리스트를 콤마로 구분된 문자열로 변환
                    tags = frontmatter.get('tags', [])
                    row['Tags'] = ', '.join(tags) if isinstance(tags, list) else tags
                    
                    row['Read Date'] = frontmatter.get('readdate', '')
                    
                    data.append(row)
    
    # DataFrame 생성 및 열 순서 지정
    df = pd.DataFrame(data)
    
    # 원하는 열 순서 (제시된 시트 틀과 일치)
    desired_columns = [
        'Title', 'Subtitle', 'Author', 'Genre', 'Category', 'Publisher', 
        'Publish Year', 'Total Pages', 'ISBN10', 'ISBN13', 'Cover URL', 
        'Status', 'Rating', 'Tags', 'Read Date'
    ]
    
    # 누락된 열이 있다면 추가 (값이 없는 열은 빈 문자열로 채워짐)
    for col in desired_columns:
        if col not in df.columns:
            df[col] = ''
            
    df = df[desired_columns]
    
    return df

# --- 사용 예시 ---
if __name__ == "__main__":
    # Markdown 파일들이 있는 폴더 경로를 지정하세요.
    # 예: script.py와 같은 폴더에 md 파일들이 있다면 '.'
    # 예: 'my_markdown_files'라는 하위 폴더에 있다면 'my_markdown_files'
    markdown_folder = './' # 현재 스크립트와 같은 위치라고 가정

    # DataFrame 생성
    output_df = process_markdown_files(markdown_folder)

    # 결과를 CSV 파일로 저장
    output_csv_filename = 'book_list.csv'
    output_df.to_csv(output_csv_filename, index=False, encoding='utf-8-sig') # 한글 깨짐 방지를 위해 'utf-8-sig' 사용

    print(f"데이터가 '{output_csv_filename}' 파일로 성공적으로 저장되었습니다.")
    print(output_df.head()) # 상위 5개 행 출력하여 확인
```
