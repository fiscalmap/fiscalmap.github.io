// DataTable 초기화 스크립트 (개선 버전)
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataTable);
  } else {
    initDataTable();
  }
  
  async function initDataTable() {
    const container = document.getElementById('datatable-root');
    if (!container) {
      console.log('DataTable: 컨테이너를 찾을 수 없습니다');
      return;
    }
    
    const csvPath = container.dataset.src || '/static/statement_of_operations2022.csv';
    console.log('DataTable: CSV 로딩 시작 -', csvPath);
    
    // CSV 파싱 (따옴표 제거 개선)
    function parseCSV(text) {
      const lines = text.trim().split('\n');
      const result = [];
      
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
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
            row.push(current);  // trim 제거 - 공백 보존
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
    
    // 계층 레벨 감지 (공백 개수 정확히 카운트)
    function detectLevel(text) {
      // 텍스트 앞의 공백 개수 세기
      let spaces = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          spaces++;
        } else {
          break;
        }
      }
      // 공백 4개 = 레벨 1, 공백 6개 = 레벨 2
      if (spaces >= 8) return 3;
      if (spaces >= 6) return 2;
      if (spaces >= 4) return 1;
      return 0;
    }
    
    // 숫자 감지
    function isNumeric(value) {
      const cleaned = value.replace(/[,\s"]/g, '');
      return cleaned !== '' && cleaned !== '0' && !isNaN(cleaned);
    }
    
    // 숫자 포맷팅
    function formatNumber(value) {
      const cleaned = value.replace(/[,"]/g, '').trim();
      if (cleaned === '' || cleaned === '0') return value.trim();
      if (!isNumeric(value)) return value.trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) return value.trim();
      return num.toLocaleString('ko-KR');
    }
    
    try {
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error('CSV 파일을 불러올 수 없습니다: ' + response.status);
      }
      
      const csvText = await response.text();
      console.log('DataTable: CSV 로딩 완료');
      
      const rows = parseCSV(csvText);
      console.log('DataTable: 파싱 완료 -', rows.length, '행');
      
      if (rows.length === 0) {
        throw new Error('CSV 파일이 비어있습니다');
      }
      
      // 첫 번째 컬럼(ACNT_YR) 제거
      const headers = rows[0].slice(1); // ACNT_YR 제거
      const dataRows = rows.slice(1).map(row => row.slice(1)); // 모든 행에서 첫 컬럼 제거
      
      console.log('헤더:', headers);
      console.log('첫 데이터 행:', dataRows[0]);
      
      // 테이블 생성
      let html = '<div style="overflow-x:auto;border:1px solid #ddd;border-radius:8px;margin:2rem 0;box-shadow:0 2px 8px rgba(0,0,0,0.05);"><table style="width:100%;border-collapse:collapse;font-size:0.9rem;min-width:800px;"><thead style="background:#f8f9fa;position:sticky;top:0;z-index:10;"><tr>';
      
      // 헤더
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i].trim();
        const align = i === 0 ? 'left' : 'center';
        html += '<th style="padding:12px 16px;text-align:' + align + ';font-weight:600;border-bottom:2px solid #ddd;white-space:nowrap;">' + header + '</th>';
      }
      
      html += '</tr></thead><tbody>';
      
      // 데이터 행
      for (let i = 0; i < dataRows.length; i++) {
        const rowData = dataRows[i];
        const categoryText = rowData[0]; // 공백 포함된 원본 텍스트
        const level = detectLevel(categoryText);
        
        console.log('행', i, '- 레벨:', level, '텍스트:', JSON.stringify(categoryText.substring(0, 20)));
        
        const fontWeight = level === 0 ? '700' : level === 1 ? '600' : '400';
        const fontSize = level === 0 ? '1rem' : level === 1 ? '0.95rem' : level === 2 ? '0.9rem' : '0.85rem';
        const bgColor = level === 0 ? 'rgba(59,130,246,0.08)' : level === 1 ? 'rgba(59,130,246,0.04)' : '';
        const textColor = level === 0 ? '#1e40af' : level === 1 ? '#3b82f6' : '#374151';
        
        html += '<tr style="background:' + bgColor + ';border-bottom:1px solid #eee;font-weight:' + fontWeight + ';font-size:' + fontSize + ';" onmouseover="this.style.background=\'rgba(59,130,246,0.1)\'" onmouseout="this.style.background=\'' + bgColor + '\'">';
        
        for (let j = 0; j < rowData.length; j++) {
          const cell = rowData[j];
          
          if (j === 0) {
            // 카테고리 컬럼 - 들여쓰기 적용
            const paddingLeft = (level * 2) + 'rem';
            const cleanText = cell.trim();
            
            // 접이식 아이콘 추가 (레벨 0, 1만)
            let icon = '';
            if (level === 0 || level === 1) {
              icon = '<span style="margin-right:8px;color:#3b82f6;font-size:0.75rem;">▼</span>';
            }
            
            html += '<td style="padding:10px 16px;padding-left:' + paddingLeft + ';text-align:left;color:' + textColor + ';">' + icon + cleanText + '</td>';
          } else {
            // 숫자 컬럼
            const value = formatNumber(cell);
            const fontFamily = isNumeric(cell) ? 'Monaco, Consolas, monospace' : 'inherit';
            html += '<td style="padding:10px 16px;text-align:right;font-family:' + fontFamily + ';">' + value + '</td>';
          }
        }
        
        html += '</tr>';
      }
      
      html += '</tbody></table></div>';
      html += '<div style="margin-top:1rem;padding:0.75rem;text-align:right;font-size:0.85rem;color:#666;">총 <strong style="color:#3b82f6;">' + dataRows.length + '</strong>개 항목</div>';
      
      container.innerHTML = html;
      console.log('DataTable: 렌더링 완료');
      
    } catch (error) {
      console.error('DataTable 오류:', error);
      container.innerHTML = '<div style="padding:2rem;text-align:center;color:#666;border:1px solid #ddd;border-radius:8px;margin:2rem 0;">⚠️ 데이터를 불러올 수 없습니다: ' + error.message + '</div>';
    }
  }
})();
