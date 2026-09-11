# UX

## Цель

Одна ссылка для семьи: карта, базы, дни, переезды и понятные описания мест без необходимости открывать Notion.

## Desktop

- Первый экран: карта + краткая сводка.
- Далее: базы проживания в порядке маршрута.
- Затем: дневной план.
- Ниже: логистика и правила безопасности данных.

## Mobile

- Первый полезный блок — «Сейчас»: актуальный день маршрута, база, короткий план, важная ремарка и прямой переход к дню или карте.
- Карта, базы и полный справочник остаются доступны, но не стоят перед действием «понять, что делать сегодня».
- Дни идут вертикальным списком с быстрым переходом по дате; подробности мест закрыты до явного раскрытия.
- Все тексты должны читаться без горизонтального скролла.

## Режим поездки (2026-09-11)

- Job and user: человек уже на Бали открывает страницу с телефона и за несколько секунд понимает сегодняшний план, базу и следующий шаг; родственник дома всё ещё может обсудить весь маршрут.
- Primary action: открыть актуальный день или выбрать нужную дату; карта — второе действие, планировочные блоки — ниже.
- Reusable rules: один короткий операционный блок перед длинной страницей; дневные карточки показывают план и ограничения сразу, а описания мест — только по раскрытию; кнопки перехода и Google Maps имеют минимум 44px по высоте; данные по-прежнему берутся из `trip.json`.
- Anti-patterns: не добавлять отдельный dashboard, новую зависимость, фиктивный «сегодняшний» контент, анимацию или дублирующие вручную описания мест.
- Responsive contract: `390x844` показывает блок «Сейчас» до полного плана и без горизонтального overflow; `560px` остаётся границей компактной композиции, `920px` — границей одной/двух колонок; desktop сохраняет маршрутный журнал и доступ ко всем разделам.

## Visual Review

- После любого изменения контента или верстки нужно просмотреть всю страницу сверху вниз на desktop и mobile.
- Проверка считается неполной, если просмотрен только изменённый блок или первый экран.
- Если во время просмотра найдены соседние визуальные проблемы, их нужно исправить в том же изменении, если это не меняет маршрутные данные.

## Visual Direction and Layout Contract (2026-09-10)

### Direction

Сайт — спокойный семейный маршрутный журнал, а не рекламный туристический лендинг и не безжизненная распечатка. Тёмная океанская обложка быстро объясняет логику маршрута и задаёт настроение. Ниже страница продолжает этот язык более светлыми, но заметно цветными карточками: цвет появляется только в реальных данных — восьми базах, их порядке и днях по географии. Заголовки используют спокойный редакционный serif, служебная навигация и данные остаются компактными и легко сканируются.

### Atlas design decision

- Job and user: родственник открывает одну публичную страницу, быстро понимает порядок баз и затем переходит к нужной дате, карте или переезду. Основное действие — навигация по маршруту, не бронирование и не продажа.
- Evidence: проект не имеет Figma или утверждённой библиотеки. Локальный Atlas-референсер был запущен с обезличенным brief, но предложил B2B/fintech-направление, поэтому оно сознательно отвергнуто как нерелевантное. Взяты только совместимые паттерны: прокручиваемая якорная навигация для длинной страницы и компактные фильтры карты; реализованы нативно в Astro/CSS.
- Reusable rules: тёмная океанская обложка содержит только факты и порядок баз, вычисляемый из `trip.bases`; тёплая поверхность отделяет длинное чтение от навигации; Georgia — display, Avenir Next — body; тон карточки дня привязан к реальной географии; акцентные дата-плашки и цветные поверхности карточек делают план живым, не меняя сами данные.
- Anti-patterns: не добавлять стоковые туристические фото, маркетинговые CTA, dashboard-сайдбар, анимацию ради эффекта, glassmorphism, серую распечаточную хронологию или новые зависимости.
- Constraints: `trip.json`, Leaflet-карта и текущие интерактивные фильтры остаются авторитетными; mobile — вертикальная композиция без горизонтальной прокрутки; motion не добавляется.

### Layout contract

- Modes: mobile `390x844`, tablet `768x1024`, windowed desktop `1180x820`, desktop `1366x768`/`1440x900`, wide desktop `1984x1046`.
- Modules: hero, route strip, sticky section navigation, overview, map, cards and long-form timeline. Within each module text and cards share the section container width; map and its control panel keep their existing content and action model.
- Hero: desktop keeps copy and four facts side by side; the route strip spans the same container beneath them and derives its count and stops from `trip.bases`. Он остаётся тёмной океанской обложкой; тёплый золотой маршрутный трек удерживает визуальную связь с последующими карточками. Mobile stacks copy, facts and route strip without clipping.
- Breakpoint: the current one-column transition remains `920px`; probes are `919`, `920`, `921`. The compact phone rules remain at `560px`; probes are `559`, `560`, `561`.
- Preserved invariants: `trip.json` remains the sole route source, all navigation anchors, map filters and marker interactions work, and no viewport has horizontal overflow.

## UI Change Contract (2026-09-10-family-route-journal)

- Requested visible change: visibly refine the page design while preserving the route data.
- Surface: `/bali-2026-trip/`, public route, no authentication.
- Exact target: the visual system of the full page, with the hero as the signature change.
- Action to reveal target: open the route at the listed viewport; click a map filter to confirm the existing interactive element stays usable.
- Baseline visible signature: pale green/blue generic hero, sans-serif headlines, square white fact cards; no visual route strip.
- Expected visible signature: deep ocean editorial hero with a route strip rendered from `trip.bases`; насыщенные, но привязанные к географии акценты на базах и карточках дней; warm paper surface and rounded route-journal cards below.
- Must remain unchanged: route text, dates, pins, ordering, map filtering, anchors and public-data safety.
- Required viewports: `390x844`, `559x844`, `560x844`, `561x844`, `768x1024`, `919x820`, `920x820`, `921x820`, `1180x820`, `1366x768`, `1440x900`, `1984x1046`.
- Attempt number: 3.

## UI Change Contract (2026-09-11-trip-mode)

- Requested visible change: сделать страницу практичным маршрутом для использования в поездке, не потеряв полный семейный план.
- Surface and state: `/bali-2026-trip/`, публичная страница; до 18 октября блок «Сейчас» показывает первый день, в даты поездки — соответствующий календарный день.
- Exact target and action: блок `#now`, селектор `#day-picker` и закрытые `details.day-places`; открыть страницу, перейти к дню и раскрыть места дня.
- Baseline signature: на `390x844` первый день начинался примерно после 9 645px контента; описания 28 мест были сразу раскрыты в дневном плане и повторялись в справочнике.
- Expected signature: до длинной страницы виден блок «Сейчас» с одним планом и действиями; выбор даты скроллит к конкретной карточке; детали мест по умолчанию закрыты; пины карты открывают Google Maps.
- Must remain unchanged: `trip.json` как единственный источник, даты, порядок баз/пинов, фильтры карты, public-data safety и отсутствие горизонтального overflow.
- Required viewports: `390x844`, `559x844`, `560x844`, `561x844`, `768x1024`, `919x820`, `920x820`, `921x820`, `1180x820`, `1366x768`, `1440x900`, `1984x1046`.
- Attempt number: 1.

## UI Change Contract (2026-09-11-eight-base-route)

- Requested visible change: заменить пятибазовый маршрут на восемь последовательных баз с островами Гили, публичными ссылками на жильё и веткой Penida только как резервом.
- Surface and state: `/bali-2026-trip/`, публичная страница без авторизации.
- Exact target: hero route strip, заголовок `#bases`, карточки баз, `#map` и карточка переезда Padang Bai -> Gili T.
- Action to reveal target: открыть маршрут; нажать фильтр карты «Острова»; раскрыть нужный день и перейти к базам.
- Baseline signature: hero показывал «5 точек» и «Пять баз», карта — Sanur/Lembongan и финальный Canggu.
- Expected signature: hero показывает «8 точек», восемь карточек в порядке Canggu -> Uluwatu, карта показывает Gili T/Gili Air/Gili Meno и Penida только с ALT, а варианты жилья открываются внешними ссылками.
- Must remain unchanged: `trip.json` остаётся единственным источником, карта и её фильтры работают, в mobile нет горизонтального overflow, приватные контакты не выводятся.
- Required viewports: `390x844`, `1180x820`, `1440x900`.
- Attempt number: 1.

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
