# UX

## Цель

Одна ссылка для семьи: карта, базы, дни, переезды и понятные описания мест без необходимости открывать Notion.

## Desktop

- Первый экран: карта + краткая сводка.
- Далее: базы проживания в порядке маршрута.
- Затем: дневной план.
- Ниже: логистика и правила безопасности данных.

## Mobile

- Карта на всю ширину.
- Сводка и базы компактными карточками.
- Дни вертикальным списком.
- Все тексты должны читаться без горизонтального скролла.

## Visual Review

- После любого изменения контента или верстки нужно просмотреть всю страницу сверху вниз на desktop и mobile.
- Проверка считается неполной, если просмотрен только изменённый блок или первый экран.
- Если во время просмотра найдены соседние визуальные проблемы, их нужно исправить в том же изменении, если это не меняет маршрутные данные.

## Visual Direction and Layout Contract (2026-09-10)

### Direction

Сайт — спокойный семейный маршрутный журнал, а не рекламный туристический лендинг и не безжизненная распечатка. Тёмная океанская обложка — утверждённый сильный первый экран: она быстро объясняет логику маршрута и задаёт настроение. Ниже страница продолжает этот язык более светлыми, но заметно цветными карточками: цвет появляется только в реальных данных — пяти базах, их порядке и днях по географии. Заголовки используют спокойный редакционный serif, служебная навигация и данные остаются компактными и легко сканируются.

### Atlas design decision

- Job and user: родственник открывает одну публичную страницу, быстро понимает порядок баз и затем переходит к нужной дате, карте или переезду. Основное действие — навигация по маршруту, не бронирование и не продажа.
- Evidence: проект не имеет Figma или утверждённой библиотеки. Локальный Atlas-референсер был запущен с обезличенным brief, но предложил B2B/fintech-направление, поэтому оно сознательно отвергнуто как нерелевантное. Взяты только совместимые паттерны: прокручиваемая якорная навигация для длинной страницы и компактные фильтры карты; реализованы нативно в Astro/CSS.
- Reusable rules: тёмная океанская обложка содержит только факты и порядок пяти баз; тёплая поверхность отделяет длинное чтение от навигации; Georgia — display, Avenir Next — body; пять последовательных акцентов привязаны к порядку баз, а тон карточки дня — к её реальной географии (дорога, побережье, Ubud, свадьба, Bukit); акцентные дата-плашки и цветные поверхности карточек делают план живым, не меняя сами данные.
- Anti-patterns: не добавлять стоковые туристические фото, маркетинговые CTA, dashboard-сайдбар, анимацию ради эффекта, glassmorphism, серую распечаточную хронологию или новые зависимости.
- Constraints: `trip.json`, Leaflet-карта и текущие интерактивные фильтры остаются авторитетными; mobile — вертикальная композиция без горизонтальной прокрутки; motion не добавляется.

### Layout contract

- Modes: mobile `390x844`, tablet `768x1024`, windowed desktop `1180x820`, desktop `1366x768`/`1440x900`, wide desktop `1984x1046`.
- Modules: hero, route strip, sticky section navigation, overview, map, cards and long-form timeline. Within each module text and cards share the section container width; map and its control panel keep their existing content and action model.
- Hero: desktop keeps copy and four facts side by side; the five-base route strip spans the same container beneath them. Он остаётся тёмной океанской обложкой; тёплый золотой маршрутный трек удерживает визуальную связь с последующими карточками. Mobile stacks copy, facts and route strip without clipping.
- Breakpoint: the current one-column transition remains `920px`; probes are `919`, `920`, `921`. The compact phone rules remain at `560px`; probes are `559`, `560`, `561`.
- Preserved invariants: `trip.json` remains the sole route source, all navigation anchors, map filters and marker interactions work, and no viewport has horizontal overflow.

## UI Change Contract (2026-09-10-family-route-journal)

- Requested visible change: visibly refine the page design while preserving the route data.
- Surface: `/bali-2026-trip/`, public route, no authentication.
- Exact target: the visual system of the full page, with the hero as the signature change.
- Action to reveal target: open the route at the listed viewport; click a map filter to confirm the existing interactive element stays usable.
- Baseline visible signature: pale green/blue generic hero, sans-serif headlines, square white fact cards; no visual route strip.
- Expected visible signature: deep ocean editorial hero with a visible five-base route strip rendered from `trip.bases`; насыщенные, но привязанные к географии акценты на базах и карточках дней; warm paper surface and rounded route-journal cards below.
- Must remain unchanged: route text, dates, pins, ordering, map filtering, anchors and public-data safety.
- Required viewports: `390x844`, `559x844`, `560x844`, `561x844`, `768x1024`, `919x820`, `920x820`, `921x820`, `1180x820`, `1366x768`, `1440x900`, `1984x1046`.
- Attempt number: 3.

## Place Descriptions

- Основной маршрут должен быть самодостаточным: если место встречается в карточке дня, рядом показывается короткое описание из `src/data/trip.json`.
- Отдельный справочник мест остаётся как полный каталог для сравнения, фильтрации решений и будущего редактирования.
- Описания мест не дублируются вручную: карточки дней подтягивают их из общего блока `places`.

## Map

- Пины должны быть цифровыми, видимыми сразу.
- Цвета различают аэропорт, базы, day trips, паром и optional.
- Popup каждой точки объясняет место по-человечески.
- У каждой точки карты должна быть дата или календарный контекст: день выезда, диапазон базы или fallback-день.
- Линия основного маршрута отличается от optional/day-trip линий.
- Карта должна объяснять, что линии рисуются только для базовых переездов, островного дня и optional/fallback; локальные места внутри базы остаются точками без линий.
- Список точек карты должен фильтроваться по смыслу: все, базы, выезды, острова, optional.
