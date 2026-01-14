import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/datatable.scss"

interface DataTableOptions {
  src?: string
  collapsible?: boolean
  stickyColumns?: number
  highlightRows?: string
  sortable?: boolean
  searchable?: boolean
  exportable?: boolean
}

export default ((userOpts?: DataTableOptions) => {
  const DataTable: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
    const options = {
      collapsible: userOpts?.collapsible ?? true,
      stickyColumns: userOpts?.stickyColumns ?? 1,
      highlightRows: userOpts?.highlightRows ?? "level-0,level-1",
      sortable: userOpts?.sortable ?? true,
      searchable: userOpts?.searchable ?? true,
      exportable: userOpts?.exportable ?? true,
      src: userOpts?.src ?? "/static/data.csv"
    }
    
    const uniqueId = `datatable-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="datatable-container" id={uniqueId}>
        {options.searchable && (
          <div className="datatable-controls">
            <div className="datatable-search">
              <input 
                type="text" 
                placeholder="검색..." 
                className="search-input"
                id={`${uniqueId}-search`}
              />
            </div>
            {options.exportable && (
              <div className="datatable-actions">
                <button className="export-btn" id={`${uniqueId}-export`}>
                  📥 CSV 내보내기
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="datatable-wrapper">
          <table className="datatable" id={`${uniqueId}-table`}>
            <thead id={`${uniqueId}-thead`}>
              {/* 헤더는 동적으로 생성됨 */}
            </thead>
            <tbody id={`${uniqueId}-tbody`}>
              {/* 데이터는 클라이언트 사이드에서 로드됨 */}
            </tbody>
          </table>
        </div>
        
        <div className="datatable-info" id={`${uniqueId}-info`}>
          총 <span className="total-rows">0</span>개 항목
        </div>
        
        <script type="module" dangerouslySetInnerHTML={{
          __html: `
            (async function() {
              const options = ${JSON.stringify(options)};
              const uniqueId = '${uniqueId}';
              
              // CSV 파싱 함수
              function parseCSV(text) {
                const lines = text.trim().split('\\n');
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
                      row.push(current.trim());
                      current = '';
                    } else {
                      current += char;
                    }
                  }
                  row.push(current.trim());
                  result.push(row);
                }
                
                return result;
              }
              
              // 계층 레벨 감지
              function detectLevel(text) {
                if (!text) return 0;
                const match = text.match(/^(\\s+)/);
                if (!match) return 0;
                const spaces = match[1].length;
                return Math.floor(spaces / 2);
              }
              
              // 숫자 감지
              function isNumeric(value) {
                if (typeof value !== 'string') return false;
                const cleaned = value.replace(/[,\\s]/g, '');
                return !isNaN(cleaned) && cleaned !== '';
              }
              
              // 숫자 포맷팅
              function formatNumber(value) {
                if (!isNumeric(value)) return value;
                const num = parseFloat(value.replace(/,/g, ''));
                if (isNaN(num)) return value;
                return num.toLocaleString('ko-KR');
              }
              
              // 데이터 로드
              try {
                const response = await fetch(options.src);
                if (!response.ok) throw new Error('CSV 파일을 불러올 수 없습니다: ' + options.src);
                
                const csvText = await response.text();
                const rows = parseCSV(csvText);
                
                if (rows.length === 0) {
                  throw new Error('CSV 파일이 비어있습니다');
                }
                
                // 헤더 생성
                const headers = rows[0];
                const thead = document.getElementById(\`\${uniqueId}-thead\`);
                const headerRow = document.createElement('tr');
                
                headers.forEach((header, index) => {
                  const th = document.createElement('th');
                  th.textContent = header;
                  
                  if (index < options.stickyColumns) {
                    th.classList.add('sticky-col');
                    th.style.left = \`\${index * 200}px\`;
                  }
                  
                  if (options.sortable && index > 0) {
                    th.classList.add('sortable');
                    th.innerHTML = \`
                      <div class="th-content">
                        <span>\${header}</span>
                        <span class="sort-icon">⇅</span>
                      </div>
                    \`;
                    th.onclick = () => sortTable(index);
                  }
                  
                  headerRow.appendChild(th);
                });
                
                thead.appendChild(headerRow);
                
                // 데이터 행 생성
                const tbody = document.getElementById(\`\${uniqueId}-tbody\`);
                const dataRows = [];
                
                for (let i = 1; i < rows.length; i++) {
                  const rowData = rows[i];
                  const tr = document.createElement('tr');
                  
                  // 첫 번째 컬럼에서 레벨 감지
                  const level = detectLevel(rowData[0]);
                  tr.classList.add(\`level-\${level}\`);
                  tr.dataset.level = level;
                  tr.dataset.rowIndex = i;
                  
                  // 하이라이트 행 설정
                  if (options.highlightRows.split(',').includes(\`level-\${level}\`)) {
                    tr.classList.add('highlight');
                  }
                  
                  rowData.forEach((cell, colIndex) => {
                    const td = document.createElement('td');
                    
                    // 첫 번째 컬럼 처리
                    if (colIndex === 0) {
                      td.classList.add('category-col');
                      
                      if (colIndex < options.stickyColumns) {
                        td.classList.add('sticky-col');
                        td.style.left = '0px';
                      }
                      
                      const cleanText = cell.trim();
                      
                      // 접이식 버튼 추가
                      if (options.collapsible && level < 2) {
                        const toggle = document.createElement('span');
                        toggle.className = 'toggle';
                        toggle.innerHTML = '▼';
                        toggle.dataset.expanded = 'true';
                        toggle.onclick = function(e) {
                          e.stopPropagation();
                          toggleRows(tr, level);
                        };
                        td.appendChild(toggle);
                      }
                      
                      const span = document.createElement('span');
                      span.textContent = cleanText;
                      td.appendChild(span);
                    } else {
                      // 숫자 컬럼 처리
                      if (isNumeric(cell)) {
                        td.classList.add('numeric');
                        td.textContent = formatNumber(cell);
                      } else {
                        td.textContent = cell;
                      }
                    }
                    
                    tr.appendChild(td);
                  });
                  
                  tbody.appendChild(tr);
                  dataRows.push({ element: tr, data: rowData });
                }
                
                // 접이식 기능
                function toggleRows(triggerRow, triggerLevel) {
                  const toggle = triggerRow.querySelector('.toggle');
                  const isExpanded = toggle.dataset.expanded === 'true';
                  
                  let nextRow = triggerRow.nextElementSibling;
                  while (nextRow) {
                    const nextLevel = parseInt(nextRow.dataset.level);
                    if (nextLevel <= triggerLevel) break;
                    
                    if (nextLevel === triggerLevel + 1) {
                      nextRow.style.display = isExpanded ? 'none' : 'table-row';
                      
                      if (isExpanded) {
                        const subToggle = nextRow.querySelector('.toggle');
                        if (subToggle) {
                          subToggle.innerHTML = '▶';
                          subToggle.dataset.expanded = 'false';
                        }
                      }
                    } else if (nextLevel > triggerLevel + 1 && isExpanded) {
                      nextRow.style.display = 'none';
                    }
                    
                    nextRow = nextRow.nextElementSibling;
                  }
                  
                  toggle.innerHTML = isExpanded ? '▶' : '▼';
                  toggle.dataset.expanded = isExpanded ? 'false' : 'true';
                }
                
                // 정렬 기능
                let sortDirection = {};
                function sortTable(columnIndex) {
                  const direction = sortDirection[columnIndex] === 'asc' ? 'desc' : 'asc';
                  sortDirection[columnIndex] = direction;
                  
                  const sortedRows = dataRows.sort((a, b) => {
                    const aVal = a.data[columnIndex];
                    const bVal = b.data[columnIndex];
                    
                    if (isNumeric(aVal) && isNumeric(bVal)) {
                      const aNum = parseFloat(aVal.replace(/,/g, ''));
                      const bNum = parseFloat(bVal.replace(/,/g, ''));
                      return direction === 'asc' ? aNum - bNum : bNum - aNum;
                    }
                    
                    return direction === 'asc' 
                      ? aVal.localeCompare(bVal) 
                      : bVal.localeCompare(aVal);
                  });
                  
                  tbody.innerHTML = '';
                  sortedRows.forEach(row => tbody.appendChild(row.element));
                  
                  // 정렬 아이콘 업데이트
                  document.querySelectorAll(\`#\${uniqueId}-thead .sort-icon\`).forEach((icon, idx) => {
                    icon.textContent = idx === columnIndex 
                      ? (direction === 'asc' ? '↑' : '↓')
                      : '⇅';
                  });
                }
                
                // 검색 기능
                if (options.searchable) {
                  const searchInput = document.getElementById(\`\${uniqueId}-search\`);
                  searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    
                    dataRows.forEach(row => {
                      const text = row.data.join(' ').toLowerCase();
                      row.element.style.display = text.includes(searchTerm) 
                        ? 'table-row' 
                        : 'none';
                    });
                  });
                }
                
                // CSV 내보내기
                if (options.exportable) {
                  const exportBtn = document.getElementById(\`\${uniqueId}-export\`);
                  exportBtn.addEventListener('click', () => {
                    const csv = rows.map(row => 
                      row.map(cell => \`"\${cell}"\`).join(',')
                    ).join('\\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'data.csv');
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  });
                }
                
                // 정보 업데이트
                document.querySelector(\`#\${uniqueId}-info .total-rows\`).textContent = dataRows.length;
                
              } catch (error) {
                console.error('DataTable 오류:', error);
                document.getElementById(\`\${uniqueId}-tbody\`).innerHTML = 
                  \`<tr><td colspan="100" style="text-align: center; padding: 2rem; color: #666;">
                    ⚠️ 데이터를 불러올 수 없습니다: \${error.message}
                  </td></tr>\`;
              }
            })();
          `
        }} />
      </div>
    )
  }

  DataTable.css = style
  return DataTable
}) satisfies QuartzComponentConstructor
