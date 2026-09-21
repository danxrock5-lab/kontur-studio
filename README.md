# kontur studio

Сайт студии с заявками в админку.

## Деплой через GitHub + Vercel

1. Создайте репозиторий на GitHub и загрузите содержимое этой папки.
2. Импортируйте репозиторий в Vercel.
3. В Vercel откройте **Project Settings → Environment Variables** и добавьте:
   - `ADMIN_PASSWORD` — длинный пароль для входа в `https://ваш-домен/admin.html`.
4. Выполните redeploy проекта.

GitHub Pages подходит только для статической части и не сможет безопасно выполнить `api/contact.js` с секретным токеном. Для работающей формы используйте Vercel или другой хостинг с serverless-функциями.

Если frontend остаётся на GitHub Pages, добавьте перед `script.js` настройку backend:

```html
<script>window.KONTUR_API_URL = 'https://ваш-проект.vercel.app';</script>
<script src="script.js"></script>
```

На Vercel добавьте `FRONTEND_ORIGIN=https://danxrock5-lab.github.io`, чтобы разрешить запросы от GitHub Pages.

## Админка

Откройте `/admin.html`. В production пароль проверяется переменной `ADMIN_PASSWORD`. На GitHub Pages серверный API недоступен, поэтому админка показывает только заявки, сохранённые локально в текущем браузере. Для общего inbox нужен Vercel и постоянное хранилище (Vercel Blob, Supabase или Postgres); массив в `api/store.js` является временным storage для демо и сбрасывается после перезапуска serverless-функции.
