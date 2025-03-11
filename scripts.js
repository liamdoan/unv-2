"use strict";
function setupVirtualList() {
    const container = document.querySelector('#virtual-list-container');
    if (!container)
        return;
    const ITEM_HEIGHT = 132; // 100px img + 1 rem padding top/bottom
    const BUFFER_SIZE = 5; // make extra 5 visible before and after
    const TOTAL_ITEMS = 10000;
    // container for imgs
    const contentWrapper = document.createElement('div');
    contentWrapper.style.position = 'relative';
    contentWrapper.style.height = `${TOTAL_ITEMS * ITEM_HEIGHT}px`;
    container.innerHTML = '';
    container.appendChild(contentWrapper);
    // set up intersection observer and lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    observer.unobserve(img);
                }
            }
        });
    }, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    });
    let lastStartIndex = 0;
    function updateVisibleItems(forceUpdate = false) {
        const scrollTop = container.scrollTop;
        const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE); // start at which item
        const visibleCount = Math.ceil(container.clientHeight / ITEM_HEIGHT) + 2 * BUFFER_SIZE; // how many items to be visible
        const endIndex = Math.min(TOTAL_ITEMS - 1, startIndex + visibleCount); // end at which item
        if (forceUpdate || Math.abs(lastStartIndex - startIndex) >= BUFFER_SIZE / 2) {
            contentWrapper.innerHTML = '';
            // add visible items
            for (let i = startIndex; i <= endIndex; i++) {
                const item = document.createElement('div');
                item.style.position = 'absolute';
                item.style.top = `${i * ITEM_HEIGHT}px`;
                item.style.width = '100%';
                item.innerHTML = `
                    <div class="list-item">
                        <img
                            src=""
                            data-src="https://picsum.photos/id/${i % 1000}/100/100" 
                            alt="Item ${i}"
                        >
                        <div>Item ${i + 1}</div>
                    </div>
                `;
                contentWrapper.appendChild(item);
                // bbserve new imgs for lazy loading
                const img = item.querySelector('img');
                if (img)
                    observer.observe(img);
            }
            lastStartIndex = startIndex;
        }
    }
    // listen for scrolling
    container.addEventListener('scroll', () => {
        requestAnimationFrame(() => updateVisibleItems(false));
    });
    requestAnimationFrame(() => {
        updateVisibleItems(true);
        setTimeout(() => updateVisibleItems(true), 0);
    });
}
setupVirtualList();
