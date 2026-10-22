/**
 * News / Announcements Component — Dragon Swim Team
 *
 * 负责主页的两处"近期消息":
 *   1) 顶部横幅 —— 显示 pinned 的那一条(可关闭,关闭状态记在 localStorage)
 *   2) News 区块(#news) —— 列出所有未过期的消息,Hero 里的 News 图标指向这里
 *
 * 内容全部来自 src/data/announcements.data.js,这个文件只负责渲染和关闭记忆。
 */

import { t } from '../utils/i18n.js';
import {
    getActiveAnnouncements,
    getBannerAnnouncement,
    formatAnnouncementDate,
} from '../data/announcements.data.js';

// 关闭过的横幅 id 存这里。key 带版本号,以后想整体重置直接改版本。
const DISMISS_KEY = 'dragon.home.banner.dismissed.v1';

function readDismissedIds() {
    try {
        const raw = window.localStorage.getItem(DISMISS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return []; // localStorage 被禁用(隐私模式)时,横幅照常显示
    }
}

function rememberDismissed(id) {
    try {
        const ids = readDismissedIds().filter((x) => x !== id);
        ids.push(id);
        // 只保留最近 20 个,避免无限增长
        window.localStorage.setItem(DISMISS_KEY, JSON.stringify(ids.slice(-20)));
    } catch {
        /* 存不了就算了,下次还会显示 */
    }
}

/** 转义成 HTML 文本 —— 消息是人工写的,别把 < > 当标签渲染。 */
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** 正文按换行切成段落(一行 = 一段)。 */
function toParagraphs(body) {
    return String(body ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

/** News 区块要列出的消息。 */
export function currentAnnouncements() {
    return getActiveAnnouncements();
}

/** 横幅要显示的那一条;用户已经关掉了同一个 id 则返回 null。 */
export function currentBanner() {
    const pinned = getBannerAnnouncement();
    if (!pinned) return null;
    return readDismissedIds().includes(pinned.id) ? null : pinned;
}

/** 顶部置顶横幅。announcement 为 null 时返回空字符串(什么都不渲染)。 */
export function renderNewsBanner(announcement) {
    if (!announcement) return '';
    const [lead] = toParagraphs(announcement.body);
    const urgent = announcement.level === 'urgent';
    return `
      <div class="news-banner${urgent ? ' is-urgent' : ''}" role="status" aria-live="polite">
        <div class="container news-banner-inner">
          <span class="news-banner-icon" aria-hidden="true">${urgent ? '📣' : '📰'}</span>
          <div class="news-banner-body">
            <strong class="news-banner-title">${escapeHtml(announcement.title)}</strong>
            ${lead ? `<span class="news-banner-text">${escapeHtml(lead)}</span>` : ''}
          </div>
          <a class="news-banner-link" href="#news">${t('news_read_more')}</a>
          <button type="button" class="news-banner-close" id="news-banner-close" aria-label="${t('news_dismiss')}" title="${t('news_dismiss')}">&#10005;</button>
        </div>
      </div>
    `;
}

/** #news 区块:列出所有有效消息;一条都没有时显示一行提示。 */
export function renderNewsSection(announcements) {
    const list = Array.isArray(announcements) ? announcements : [];
    const cards = list.length
        ? list.map(newsCard).join('')
        : `<p class="news-empty">${t('news_empty')}</p>`;

    return `
      <section class="section news-section" id="news">
        <div class="container">
          <div class="text-center animate-on-scroll" style="margin-bottom: var(--space-2xl);">
            <span class="badge badge-primary">${t('news_badge')}</span>
            <h2 class="section-title" style="margin-top: var(--space-md);">${t('news_title')}</h2>
            <div class="divider" style="margin: var(--space-md) auto;"></div>
            <p class="section-subtitle" style="margin: 0 auto;">${t('news_subtitle')}</p>
          </div>
          <div class="news-grid">${cards}</div>
        </div>
      </section>
    `;
}

function newsCard(a) {
    const urgent = a.level === 'urgent';
    const body = toParagraphs(a.body).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
    const link = a.link && a.link.href
        ? (() => {
            const external = /^https?:/i.test(a.link.href);
            return `<a class="news-card-link" href="${escapeHtml(a.link.href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${escapeHtml(a.link.label || t('news_read_more'))} &rarr;</a>`;
        })()
        : '';

    return `
      <article class="news-card${urgent ? ' is-urgent' : ''}">
        <div class="news-card-meta">
          <time class="news-card-date" datetime="${escapeHtml(a.date || '')}">${escapeHtml(formatAnnouncementDate(a.date))}</time>
          ${a.pinned ? `<span class="news-card-pin">${t('news_pinned')}</span>` : ''}
        </div>
        <h3 class="news-card-title">${escapeHtml(a.title)}</h3>
        <div class="news-card-body">${body}</div>
        ${link}
      </article>
    `;
}

/**
 * 给横幅的关闭按钮挂上事件。
 * 必须在横幅 HTML 插入 DOM 之后调用,并且传入渲染时用的那条消息。
 */
export function initNewsBanner(announcement) {
    const banner = document.querySelector('.news-banner');
    const closeBtn = document.getElementById('news-banner-close');
    if (!banner || !closeBtn || !announcement) return;

    closeBtn.addEventListener('click', () => {
        rememberDismissed(announcement.id);
        banner.style.transition = 'opacity 150ms ease';
        banner.style.opacity = '0';
        window.setTimeout(() => banner.remove(), 160);
    });
}
