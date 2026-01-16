// DataTable 초기화 스크립트 (왼쪽 정렬 수정)
(function() {
  console.log('DataTable: 스크립트 로드됨');

  function initAllDataTables() {
    const containers = document.querySelectorAll('.datatable-container');
    console.log('DataTable: 컨테이너 개수 =', containers.length);

    containers.forEach((container, index) => {
      console.log(`DataTable ${index + 1}: 초기화 시작`);
      initDataTable(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllDataTables);
  } else {
    initAllDataTables();
  }

  // SPA 네비게이션 이벤트 처리
  document.addEventListener('nav', () => {
    console.log('DataTable: 페이지 전환 감지');
    setTimeout(initAllDataTables, 100);
  });

  async function initDataTable(container) {
    const csvPath = container.dataset.src;
    if (!csvPath) {
      console.error('DataTable: data-src 속성이 없습니다');
      return;
    }

    console.log('DataTable: CSV 로딩 -', csvPath);

    try {
      const response = await fetch(csvPath);
      if (!response.ok) throw new Error('CSV 파일 로딩 실패: ' + response.status);

      const csvText = await response.text();
      console.log('DataTable: CSV 텍스트 길이 =', csvText.length);

      const rows = parseCSV(csvText);
      console.log('DataTable: 파싱된 행 수 =', rows.length);

      if (rows.length === 0) {
        container.innerHTML = '<div style="padding:2rem;text-align:center;color:#666;">데이터가 없습니다</div>';
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      console.log('DataTable: 헤더 =', headers);
      console.log('DataTable: 첫 번째 데이터 행 =', dataRows[0]);

      // Description 컬럼에서 계층 레벨 분석
      console.log('\nDataTable: 계층 구조 분석:');
      dataRows.forEach((row, idx) => {
        const desc = row[1] || ''; // Description 컬럼
        const level = detectLevel(desc);
        if (idx < 10) {
          console.log(`  행 ${idx}: "${desc}" (공백:${countSpaces(desc)}) -> 레벨 ${level}`);
        }
      });

      renderTable(container, headers, dataRows);

    } catch (error) {
      console.error('DataTable 오류:', error);
      container.innerHTML = `<div style="padding:2rem;text-align:center;color:#dc2626;border:1px solid #fca5a5;border-radius:8px;background:#fef2f2;">
      ⚠️ 데이터를 불러올 수 없습니다: ${error.message}
      </div>`;
    }
  }

  // CSV 파싱 (따옴표 처리 포함)
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const result = [];

    for (let line of lines) {
      const row = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          row.push(current); // 공백 보존!
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current);
      result.push(row);
    }

    return result;
  }

  // 공백 개수 세기 (디버깅용)
  function countSpaces(text) {
    if (!text) return 0;
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ') count++;
      else break;
    }
    return count;
  }

  // 계층 레벨 감지 - Description 필드의 앞 공백 개수로 판단
  function detectLevel(text) {
    if (!text) return 0;

    const spaces = countSpaces(text);

    // 2칸 = 레벨 1, 4칸 = 레벨 2, 6칸 = 레벨 3
    if (spaces >= 6) return 3;
    if (spaces >= 4) return 2;
    if (spaces >= 2) return 1;
    return 0;
  }

  // 숫자 판별
  function isNumeric(value) {
    if (!value) return false;
    const cleaned = String(value).replace(/[,\s"']/g, '');
    return cleaned !== '' && !isNaN(cleaned);
  }

  // 숫자 포맷팅
  function formatNumber(value) {
    if (!value || value === '') return '';
    const cleaned = String(value).replace(/[,"']/g, '').trim();
    if (!isNumeric(value)) return value.trim();

    const num = parseFloat(cleaned);
    if (isNaN(num)) return value.trim();

    return num.toLocaleString('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  // 테이블 렌더링
  function renderTable(container, headers, dataRows) {
    let html = '<div style="overflow-x:auto;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">';
    html += '<table style="width:100%;border-collapse:collapse;background:white;">';

    // 헤더
    html += '<thead><tr style="background:#f3f4f6;border-bottom:2px solid #e5e7eb;">';
    headers.forEach((header, idx) => {
      if (idx === 0) {
        // Code 컬럼
        html += `<th style="padding:12px 16px;text-align:left !important;font-weight:600;color:#374151;font-size:0.875rem;">${header}</th>`;
      } else if (idx === 1) {
        // Description 컬럼 - 왼쪽 정렬 강제
        html += `<th style="padding:12px 16px;text-align:left !important;font-weight:600;color:#374151;font-size:0.875rem;">${header}</th>`;
      } else {
        // Category 컬럼 - 오른쪽 정렬
        html += `<th style="padding:12px 16px;text-align:right !important;font-weight:600;color:#374151;font-size:0.875rem;">${header}</th>`;
      }
    });
    html += '</tr></thead>';

    // 본문
    html += '<tbody>';
    dataRows.forEach((row, rowIdx) => {
      const descCol = row[1] || ''; // Description
      const level = detectLevel(descCol);

      // 레벨별 스타일
      const fontWeight = level === 0 ? '700' : level === 1 ? '600' : '400';
      const fontSize = level === 0 ? '1rem' : level === 1 ? '0.95rem' : level === 2 ? '0.9rem' : '0.85rem';
      const bgColor = level === 0 ? 'rgba(59,130,246,0.08)' : level === 1 ? 'rgba(59,130,246,0.04)' : '';
      const textColor = level === 0 ? '#1e40af' : level === 1 ? '#3b82f6' : '#374151';

      html += `<tr style="background:${bgColor};border-bottom:1px solid #eee;font-weight:${fontWeight};font-size:${fontSize};"
      onmouseover="this.style.background='rgba(59,130,246,0.1)'"
      onmouseout="this.style.background='${bgColor}'">`;

      row.forEach((cell, colIdx) => {
        if (colIdx === 0) {
          // Code 컬럼 - 왼쪽 정렬
          html += `<td style="padding:10px 16px;text-align:left !important;color:#6b7280;font-family:Monaco,monospace;font-size:0.85rem;">${cell}</td>`;
        } else if (colIdx === 1) {
          // Description 컬럼 - 왼쪽 정렬 + 들여쓰기
          const paddingLeft = (level * 1.5 + 1) + 'rem';
          const cleanText = cell.trim();

          // 접기/펼치기 아이콘 추가 (레벨 0, 1만)
          let icon = '';
          if (level === 0 || level === 1) {
            icon = '<span style="display:inline-block;margin-right:8px;color:#3b82f6;font-size:0.75rem;width:12px;">▼</span>';
          }

          html += `<td style="padding:10px 16px;padding-left:${paddingLeft};text-align:left !important;color:${textColor};">${icon}${cleanText}</td>`;
        } else {
          // Category 컬럼 - 오른쪽 정렬
          const value = cell.trim();
          html += `<td style="padding:10px 16px;text-align:right !important;color:#374151;">${value}</td>`;
        }
      });

      html += '</tr>';
    });

    html += '</tbody></table></div>';
    html += `<div style="margin-top:1rem;padding:0.75rem;text-align:right;font-size:0.85rem;color:#666;">
    총 <strong style="color:#3b82f6;">${dataRows.length}</strong>개 항목
    </div>`;

    container.innerHTML = html;
    console.log('DataTable: 렌더링 완료 ✓');
  }
})();
