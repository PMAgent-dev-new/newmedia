'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // HTMLコンテンツから見出しを抽出（h2とh3のみ）
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    
    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      const text = heading.textContent || '';
      const level = parseInt(heading.tagName.charAt(1));
      const id = `heading-${index}`;
      
      // 実際のDOMに見出しIDを設定するため、後で使用
      heading.id = id;
      
      return { id, text, level };
    });

    setTocItems(items);

    // 実際のDOMの見出しにIDを設定（h2とh3のみ）
    const realHeadings = document.querySelectorAll(
      '.article-content h2, .article-content h3, .article-content-html h2, .article-content-html h3'
    );
    realHeadings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });

    // スクロール時のアクティブな見出しを追跡
    const handleScroll = () => {
      const headingElements = Array.from(realHeadings);
      const scrollPosition = window.scrollY + 200;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i] as HTMLElement;
        if (element.offsetTop <= scrollPosition) {
          setActiveId(element.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初期化時に実行

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [content]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white relative rounded-[10px] border-[1.5px] border-[#333333] w-full mb-8">
      <div className="p-6">
        {/* タイトル */}
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          目次
        </h3>
        
        {/* 目次リスト - 階層構造 */}
        <div className="space-y-2" key="toc-list">
          {tocItems.map((item, index) => {
            // h2のカウンターを計算
            const h2Count = tocItems.slice(0, index + 1).filter(t => t.level === 2).length;
            
            return (
              <div key={item.id}>
                <div 
                  className={`cursor-pointer transition-colors duration-200 ${
                    item.level === 2 ? 'mb-1' : 'mb-0.5'
                  }`}
                  onClick={() => handleClick(item.id)}
                >
                  <div className={`flex items-start ${
                    item.level === 3 ? 'ml-4' : ''
                  }`}>
                    {/* h2の場合は数字、h3の場合は点 */}
                    <div className={`${
                      item.level === 2 
                        ? 'text-base font-semibold text-[#333333] mr-2 min-w-[20px]' 
                        : 'text-sm text-[#666666] mr-2'
                    }`}>
                      {item.level === 2 ? `${h2Count}.` : '•'}
                    </div>
                    <div 
                      className={`${
                        item.level === 2 
                          ? 'text-base font-medium text-[#2204db]' 
                          : 'text-sm text-[#2204db]'
                      } hover:text-[#130278] hover:underline ${
                        activeId === item.id ? 'font-semibold text-[#130278]' : ''
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                </div>
                
                {/* ボーダーを非表示 */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
