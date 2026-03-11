/**
 * Tailoring: slight personalization of welcome text based on browser-revealed data.
 * All logic runs client-side; no data is sent or stored.
 * Part of research on targeting and tailoring in political communication.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'tailoring-disabled';
  var DEFAULT_GREETING = 'Welcome!';

  function getTailoringDisabled() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setTailoringDisabled(disabled) {
    try {
      if (disabled) {
        localStorage.setItem(STORAGE_KEY, '1');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  }

  function getDeviceType(ua) {
    if (!ua) return null;
    if (/iPhone/i.test(ua) && !/iPad/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/iPod/i.test(ua)) return 'iPod';
    if (/Android/i.test(ua)) {
      return /Mobile/i.test(ua) ? 'Android phone' : 'Android tablet';
    }
    if (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) {
      if (navigator.maxTouchPoints > 1) return 'iPad';
      return 'MacBook';
    }
    if (/Windows/i.test(ua)) return 'Windows PC';
    if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'Linux PC';
    return null;
  }

  function getBrowserData(callback) {
    var now = new Date();
    var hour = now.getHours();
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    var lang = (navigator.language || navigator.userLanguage || '').slice(0, 2);
    var ua = navigator.userAgent || '';
    var device = getDeviceType(ua);

    var data = {
      hour: hour,
      timezone: tz,
      language: lang,
      device: device
    };

    if (navigator.getBattery) {
      navigator.getBattery().then(function (battery) {
        data.batteryLevel = battery.level;
        data.batteryCharging = battery.charging;
        callback(data);
      }).catch(function () {
        callback(data);
      });
    } else {
      callback(data);
    }
  }

  var GREETINGS = {
    de: ['Guten Morgen!', 'Guten Tag!', 'Guten Abend!', 'Willkommen!'],
    fr: ['Bonjour!', 'Bon après-midi!', 'Bonsoir!', 'Bienvenue!'],
    es: ['¡Buenos días!', '¡Buenas tardes!', '¡Buenas noches!', '¡Bienvenido!'],
    ca: ['Bon dia!', 'Bona tarda!', 'Bona nit!', 'Benvingut!'],
    it: ['Buongiorno!', 'Buon pomeriggio!', 'Buonasera!', 'Benvenuto!'],
    pt: ['Bom dia!', 'Boa tarde!', 'Boa noite!', 'Bem-vindo!'],
    nl: ['Goedemorgen!', 'Goedemiddag!', 'Goedenavond!', 'Welkom!'],
    nb: ['God morgen!', 'God ettermiddag!', 'God kveld!', 'Velkommen!'],
    nn: ['God morgon!', 'God ettermiddag!', 'God kveld!', 'Velkommen!'],
    no: ['God morgen!', 'God ettermiddag!', 'God kveld!', 'Velkommen!'],
    sv: ['God morgon!', 'God eftermiddag!', 'God kväll!', 'Välkommen!'],
    da: ['God morgen!', 'God eftermiddag!', 'God aften!', 'Velkommen!'],
    pl: ['Dzień dobry!', 'Dzień dobry!', 'Dobry wieczór!', 'Witaj!'],
    el: ['Καλημέρα!', 'Καλό απόγευμα!', 'Καλησπέρα!', 'Καλώς ήρθες!'],
    tr: ['Günaydın!', 'İyi günler!', 'İyi akşamlar!', 'Hoş geldin!'],
    ru: ['Доброе утро!', 'Добрый день!', 'Добрый вечер!', 'Добро пожаловать!'],
    ja: ['おはようございます!', 'こんにちは!', 'こんばんは!', 'ようこそ!'],
    zh: ['早上好!', '下午好!', '晚上好!', '欢迎!'],
    ko: ['좋은 아침!', '좋은 오후!', '좋은 저녁!', '환영합니다!'],
    ar: ['صباح الخير!', 'مساء الخير!', 'مساء الخير!', 'أهلاً!'],
    hr: ['Dobro jutro!', 'Dobar dan!', 'Dobra večer!', 'Dobrodošli!'],
    cs: ['Dobré ráno!', 'Dobré odpoledne!', 'Dobrý večer!', 'Vítejte!'],
    sk: ['Dobré ráno!', 'Dobré popoludnie!', 'Dobrý večer!', 'Vitajte!'],
    hu: ['Jó reggelt!', 'Jó napot!', 'Jó estét!', 'Üdvözöljük!'],
    ro: ['Bună dimineața!', 'Bună ziua!', 'Bună seara!', 'Bine ați venit!'],
    bg: ['Добро утро!', 'Добър ден!', 'Добър вечер!', 'Добре дошли!'],
    uk: ['Доброго ранку!', 'Добрий день!', 'Добрий вечір!', 'Ласкаво просимо!'],
    fi: ['Hyvää huomenta!', 'Hyvää päivää!', 'Hyvää iltaa!', 'Tervetuloa!'],
    et: ['Tere hommikust!', 'Tere päevast!', 'Tere õhtust!', 'Tere tulemast!'],
    lt: ['Labas rytas!', 'Laba diena!', 'Labas vakaras!', 'Sveiki!'],
    lv: ['Labrīt!', 'Labdien!', 'Labvakar!', 'Laipni lūdzam!'],
    sl: ['Dobro jutro!', 'Dober dan!', 'Dober večer!', 'Dobrodošli!'],
    sr: ['Добро јутро!', 'Добар дан!', 'Добро вече!', 'Добродошли!'],
    mk: ['Добро утро!', 'Добар ден!', 'Добро вече!', 'Добредојдовте!'],
    ga: ['Maidin mhaith!', 'Tráthnóna maith!', 'Tráthnóna maith!', 'Fáilte!'],
    eu: ['Egun on!', 'Arratsalde on!', 'Arratsalde on!', 'Ongi etorri!'],
    gl: ['Bos días!', 'Boas tardes!', 'Boas noites!', 'Benvido!']
  };

  function getGreetingForHour(hour, lang) {
    var g = GREETINGS[lang];
    if (!g) g = ['Good morning!', 'Good afternoon!', 'Good evening!', 'Welcome!'];
    if (hour >= 5 && hour < 12) return g[0];
    if (hour >= 12 && hour < 17) return g[1];
    if (hour >= 17 && hour < 21) return g[2];
    return g[3];
  }

  function getTailoredSuffix(data) {
    var parts = [];
    var country = data.timezone ? getCountryFromTimezone(data.timezone) : null;
    var fromWhere = country ? (country === 'Americas' ? 'from the Americas' : 'from ' + country) : (data.language && data.language !== 'en' ? 'from wherever you are' : null);
    if (data.device) {
      parts.push('Great that you\'re visiting on your ' + data.device);
      if (fromWhere) parts.push(fromWhere);
    } else if (fromWhere) {
      parts.push('Great to have you here ' + fromWhere);
    }
    if (data.batteryLevel !== undefined && !data.batteryCharging && data.batteryLevel < 0.2) {
      parts.push('I\'ll keep it short—your battery is low');
    }
    if (parts.length === 0) return '';
    return ' ' + parts.join(' ') + '.';
  }

  function getCriteriaText(data, disabled) {
    if (disabled) return 'Tailoring off.';
    var parts = [];
    parts.push('time of day (' + hourToPeriod(data.hour) + ')');
    if (data.timezone) {
      var country = getCountryFromTimezone(data.timezone);
      parts.push('time zone (' + data.timezone + (country ? ' → ' + country : '') + ')');
    }
    if (data.language) parts.push('language (' + data.language + ')');
    if (data.device) parts.push('device (' + data.device + ')');
    if (data.batteryLevel !== undefined) {
      var bat = data.batteryLevel >= 1 ? 'fully charged' : (Math.round(data.batteryLevel * 100) + '%');
      if (data.batteryCharging) bat += ', charging';
      parts.push('battery (' + bat + ')');
    }
    return 'Based on: ' + parts.join(', ');
  }

  function hourToPeriod(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /* Infer country from IANA timezone. Covers common zones; fallback uses region patterns. */
  function getCountryFromTimezone(tz) {
    if (!tz) return null;
    var m = {
      'Europe/Berlin': 'Germany', 'Europe/Busingen': 'Germany',
      'Europe/London': 'United Kingdom',
      'Europe/Paris': 'France', 'Europe/Monaco': 'France',
      'Europe/Madrid': 'Spain', 'Europe/Ceuta': 'Spain', 'Atlantic/Canary': 'Spain',
      'Europe/Rome': 'Italy', 'Europe/San_Marino': 'Italy', 'Europe/Vatican': 'Italy',
      'Europe/Amsterdam': 'Netherlands',
      'Europe/Brussels': 'Belgium',
      'Europe/Vienna': 'Austria',
      'Europe/Zurich': 'Switzerland',
      'Europe/Stockholm': 'Sweden',
      'Europe/Oslo': 'Norway',
      'Europe/Copenhagen': 'Denmark',
      'Europe/Helsinki': 'Finland', 'Europe/Mariehamn': 'Finland',
      'Europe/Warsaw': 'Poland',
      'Europe/Prague': 'Czech Republic',
      'Europe/Budapest': 'Hungary',
      'Europe/Bucharest': 'Romania',
      'Europe/Athens': 'Greece',
      'Europe/Sofia': 'Bulgaria',
      'Europe/Moscow': 'Russia', 'Europe/Kaliningrad': 'Russia', 'Europe/Samara': 'Russia', 'Europe/Volgograd': 'Russia', 'Asia/Yekaterinburg': 'Russia', 'Asia/Novosibirsk': 'Russia', 'Asia/Vladivostok': 'Russia',
      'Europe/Istanbul': 'Turkey',
      'Europe/Dublin': 'Ireland',
      'Europe/Lisbon': 'Portugal', 'Atlantic/Azores': 'Portugal', 'Atlantic/Madeira': 'Portugal',
      'Europe/Luxembourg': 'Luxembourg',
      'Europe/Malta': 'Malta',
      'Europe/Riga': 'Latvia', 'Europe/Tallinn': 'Estonia', 'Europe/Vilnius': 'Lithuania',
      'Europe/Belgrade': 'Serbia', 'Europe/Zagreb': 'Croatia', 'Europe/Ljubljana': 'Slovenia', 'Europe/Sarajevo': 'Bosnia and Herzegovina', 'Europe/Skopje': 'North Macedonia', 'Europe/Podgorica': 'Montenegro',
      'Europe/Tirane': 'Albania',
      'Europe/Nicosia': 'Cyprus',
      'Europe/Minsk': 'Belarus', 'Europe/Kiev': 'Ukraine', 'Europe/Chisinau': 'Moldova',
      'America/New_York': 'United States', 'America/Chicago': 'United States', 'America/Denver': 'United States', 'America/Los_Angeles': 'United States', 'America/Phoenix': 'United States', 'America/Anchorage': 'United States', 'Pacific/Honolulu': 'United States', 'America/Detroit': 'United States', 'America/Boise': 'United States', 'America/Indiana/Indianapolis': 'United States',
      'America/Mexico_City': 'Mexico', 'America/Cancun': 'Mexico', 'America/Merida': 'Mexico', 'America/Monterrey': 'Mexico', 'America/Tijuana': 'Mexico', 'America/Chihuahua': 'Mexico', 'America/Mazatlan': 'Mexico',
      'America/Toronto': 'Canada', 'America/Vancouver': 'Canada', 'America/Edmonton': 'Canada', 'America/Winnipeg': 'Canada', 'America/Halifax': 'Canada', 'America/St_Johns': 'Canada',
      'America/Sao_Paulo': 'Brazil', 'America/Manaus': 'Brazil', 'America/Fortaleza': 'Brazil',
      'America/Buenos_Aires': 'Argentina', 'America/Cordoba': 'Argentina',
      'America/Santiago': 'Chile',
      'America/Bogota': 'Colombia',
      'America/Lima': 'Peru',
      'America/Caracas': 'Venezuela',
      'America/Guayaquil': 'Ecuador',
      'America/Panama': 'Panama',
      'America/Costa_Rica': 'Costa Rica',
      'America/Guatemala': 'Guatemala',
      'America/Havana': 'Cuba',
      'America/Jamaica': 'Jamaica',
      'America/Santo_Domingo': 'Dominican Republic',
      'America/Puerto_Rico': 'Puerto Rico',
      'Asia/Tokyo': 'Japan',
      'Asia/Shanghai': 'China', 'Asia/Hong_Kong': 'Hong Kong', 'Asia/Taipei': 'Taiwan',
      'Asia/Seoul': 'South Korea',
      'Asia/Singapore': 'Singapore',
      'Asia/Bangkok': 'Thailand',
      'Asia/Jakarta': 'Indonesia',
      'Asia/Kuala_Lumpur': 'Malaysia',
      'Asia/Manila': 'Philippines',
      'Asia/Ho_Chi_Minh': 'Vietnam',
      'Asia/Kolkata': 'India',
      'Asia/Dubai': 'United Arab Emirates',
      'Asia/Jerusalem': 'Israel',
      'Asia/Riyadh': 'Saudi Arabia',
      'Asia/Tehran': 'Iran',
      'Australia/Sydney': 'Australia', 'Australia/Melbourne': 'Australia', 'Australia/Brisbane': 'Australia', 'Australia/Perth': 'Australia', 'Australia/Adelaide': 'Australia',
      'Pacific/Auckland': 'New Zealand',
      'Africa/Johannesburg': 'South Africa',
      'Africa/Cairo': 'Egypt',
      'Africa/Lagos': 'Nigeria',
      'Africa/Nairobi': 'Kenya',
      'UTC': null
    };
    if (m[tz]) return m[tz];
    if (/^America\//.test(tz)) return 'Americas';
    if (/^Europe\//.test(tz)) return 'Europe';
    if (/^Asia\//.test(tz)) return 'Asia';
    if (/^Africa\//.test(tz)) return 'Africa';
    if (/^Pacific\//.test(tz)) return 'Pacific';
    if (/^Australia\//.test(tz)) return 'Australia';
    if (/^Atlantic\//.test(tz)) return 'Atlantic';
    return null;
  }

  function getTimezoneRegions(tz) {
    if (!tz) return { germany: false, europe: false, uk: false, mexico: false, us: false };
    var germany = /^Europe\/(Berlin|Busingen)$/.test(tz);
    var europe = /^Europe\//.test(tz);
    var uk = tz === 'Europe/London';
    var mexico = /^America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Mazatlan|Chihuahua|Ojinaga|Tijuana|Bahia_Banderas)$/.test(tz);
    return { germany: germany, europe: europe, uk: uk, mexico: mexico };
  }

  function applyTimezoneTailoring(data, disabled) {
    if (disabled) {
      ['witten', 'europe', 'dynamics', 'berlin', 'hertie'].forEach(function (id) {
        var el = document.getElementById('tailored-' + id);
        if (el) el.textContent = '';
      });
      return;
    }
    var r = getTimezoneRegions(data.timezone);
    var witten = document.getElementById('tailored-witten');
    var europe = document.getElementById('tailored-europe');
    var dynamics = document.getElementById('tailored-dynamics');
    var berlin = document.getElementById('tailored-berlin');
    var hertie = document.getElementById('tailored-hertie');
    if (witten && !r.germany) witten.textContent = ' (in Germany)';
    else if (witten) witten.textContent = '';
    if (europe && !r.europe) europe.textContent = ' — I\'m based in Europe';
    else if (europe) europe.textContent = '';
    if (dynamics && !r.germany) dynamics.textContent = ' (Berlin)';
    else if (dynamics) dynamics.textContent = '';
    if (berlin && !r.germany) berlin.textContent = ' (Germany)';
    else if (berlin) berlin.textContent = '';
    if (hertie && !r.germany) hertie.textContent = ' in Berlin';
    else if (hertie) hertie.textContent = '';
  }

  function applyTailoring(data) {
    var greetingEl = document.getElementById('tailored-greeting');
    var suffixEl = document.getElementById('tailored-suffix');
    var criteriaEl = document.getElementById('tailoring-criteria');
    if (!greetingEl) return;

    var disabled = getTailoringDisabled();

    if (criteriaEl) criteriaEl.textContent = getCriteriaText(data, disabled);

    applyTimezoneTailoring(data, disabled);

    if (disabled) {
      greetingEl.textContent = DEFAULT_GREETING;
      if (suffixEl) suffixEl.textContent = '';
      updateHighlight();
      return;
    }

    greetingEl.textContent = getGreetingForHour(data.hour, data.language);
    if (suffixEl) suffixEl.textContent = getTailoredSuffix(data);
    updateHighlight();
  }

  function updateHighlight() {
    var on = !getTailoringDisabled();
    document.querySelectorAll('.tailored-content').forEach(function (el) {
      el.classList.toggle('tailored-content--highlighted', on);
    });
  }

  function initToggle() {
    var checkbox = document.getElementById('tailoring-toggle-checkbox');
    if (!checkbox) return;

    checkbox.checked = !getTailoringDisabled();

    checkbox.addEventListener('change', function () {
      setTailoringDisabled(!checkbox.checked);
      getBrowserData(function (data) {
        applyTailoring(data);
      });
    });
  }

  function initDisclaimerExpand() {
    var btn = document.getElementById('tailoring-disclaimer-toggle');
    var content = document.getElementById('tailoring-disclaimer-content');
    if (!btn || !content) return;

    btn.setAttribute('aria-expanded', 'false');
    content.hidden = true;

    btn.addEventListener('click', function () {
      var expanded = content.hidden;
      content.hidden = !expanded;
      btn.setAttribute('aria-expanded', String(expanded));
      btn.textContent = expanded ? 'Show less' : 'More info …';
    });
  }

  function initFootnoteLink() {
    var link = document.getElementById('tailoring-footnote-ref');
    var target = document.getElementById('tailoring-explainer');
    var btn = document.getElementById('tailoring-disclaimer-toggle');
    var content = document.getElementById('tailoring-disclaimer-content');
    if (!link || !target) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (content && content.hidden && btn) {
        content.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'Show less';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    getBrowserData(function (data) {
      applyTailoring(data);
    });
    initToggle();
    initDisclaimerExpand();
    initFootnoteLink();
  });
})();
