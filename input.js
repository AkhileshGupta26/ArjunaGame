// Arjuna Input Controller: Optimized for Phone Landscape & Universal Controls
(function () {
  if (window.MyPipInput) return;

  var DEADZONE = 0.12;
  var STICK_RADIUS = 50;
  var BUTTON_SIZE = 76;
  var SECONDARY_SIZE = 60;
  var PAUSE_SIZE = 44;

  var MOVE_KEYS = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
  var ACTION_KEYS = { Space: 'a', Enter: 'a', KeyJ: 'a', KeyZ: 'a', ShiftLeft: 'b', ShiftRight: 'b', KeyK: 'b', KeyX: 'b', Escape: 'pause', KeyP: 'pause' };
  var GAMEPAD_BUTTONS = { 0: 'a', 1: 'b', 2: 'b', 9: 'pause' };
  var ACTIONS = ['a', 'b', 'pause'];

  var config = null;
  var controlsShown = true;
  
  function checkMobileScreen() {
    return (innerWidth <= 1050 && innerHeight <= 650) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (window.matchMedia && matchMedia('(pointer: coarse)').matches) ||
           (window.matchMedia && matchMedia('(orientation: landscape) and (max-height: 650px)').matches);
  }

  var isTouch = checkMobileScreen();
  var device = isTouch ? 'touch' : 'keyboard';
  var keys = {};
  var held = { a: false, b: false, pause: false };
  var sources = { keyboard: {}, touch: {}, gamepad: {} };
  var pressed = { a: false, b: false, pause: false };
  var listeners = { a: [], b: [], pause: [], device: [] };
  var stick = { x: 0, y: 0, pointer: null, originX: 0, originY: 0, active: false };
  var gamepad = { move: { x: 0, y: 0 }, look: { x: 0, y: 0 } };
  var lookDrag = { x: 0, y: 0, pointer: null, lastX: 0, lastY: 0 };
  var ui = null;

  function clamp(value) { return Math.max(-1, Math.min(1, value)); }
  function deadzone(value) { return Math.abs(value) < DEADZONE ? 0 : value; }
  function limit(vector) {
    var length = Math.hypot(vector.x, vector.y);
    return length > 1 ? { x: vector.x / length, y: vector.y / length } : vector;
  }

  function setDevice(next) {
    if (device === next) return;
    device = next;
    render();
    listeners.device.forEach(function (fn) { fn(device); });
  }

  function setAction(source, action, down) {
    sources[source][action] = down;
    var now = Boolean(sources.keyboard[action] || sources.touch[action] || sources.gamepad[action]);
    if (now && !held[action]) {
      pressed[action] = true;
      listeners[action].forEach(function (fn) { fn(); });
    }
    held[action] = now;
  }

  function keyboardMove() {
    var x = 0, y = 0;
    Object.keys(MOVE_KEYS).forEach(function (code) {
      if (keys[code]) { x += MOVE_KEYS[code][0]; y += MOVE_KEYS[code][1]; }
    });
    return limit({ x: x, y: y });
  }

  function isTextField(target) {
    return Boolean(target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)));
  }

  addEventListener('keydown', function (event) {
    if (!MOVE_KEYS[event.code] && !ACTION_KEYS[event.code]) return;
    if (isTextField(event.target)) return;
    if (!/^(BUTTON|A)$/.test(event.target && event.target.tagName)) event.preventDefault();
    if (!checkMobileScreen()) setDevice('keyboard');
    keys[event.code] = true;
    if (ACTION_KEYS[event.code]) setAction('keyboard', ACTION_KEYS[event.code], true);
  });
  
  addEventListener('keyup', function (event) {
    keys[event.code] = false;
    if (ACTION_KEYS[event.code]) setAction('keyboard', ACTION_KEYS[event.code], Object.keys(ACTION_KEYS).some(function (code) {
      return keys[code] && ACTION_KEYS[code] === ACTION_KEYS[event.code];
    }));
  });
  
  addEventListener('blur', function () {
    keys = {};
    ACTIONS.forEach(function (action) { setAction('keyboard', action, false); });
  });

  addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'touch' || checkMobileScreen()) {
      setDevice('touch');
    }
  }, true);

  function pollGamepads() {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    var active = null;
    for (var i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) { active = pads[i]; break; }
    if (active) {
      var axes = active.axes;
      var button = function (index) { return Boolean(active.buttons[index] && active.buttons[index].pressed); };
      var dx = (button(15) ? 1 : 0) - (button(14) ? 1 : 0);
      var dy = (button(13) ? 1 : 0) - (button(12) ? 1 : 0);
      gamepad.move = limit({ x: deadzone(axes[0] || 0) || dx, y: deadzone(axes[1] || 0) || dy });
      gamepad.look = { x: deadzone(axes[2] || 0), y: deadzone(axes[3] || 0) };
      var used = gamepad.move.x || gamepad.move.y || gamepad.look.x || gamepad.look.y;
      Object.keys(GAMEPAD_BUTTONS).forEach(function (index) {
        if (button(Number(index))) used = true;
      });
      ACTIONS.forEach(function (action) {
        setAction('gamepad', action, Object.keys(GAMEPAD_BUTTONS).some(function (index) {
          return GAMEPAD_BUTTONS[index] === action && button(Number(index));
        }));
      });
      if (used) setDevice('gamepad');
    } else {
      gamepad.move = { x: 0, y: 0 };
      gamepad.look = { x: 0, y: 0 };
      ACTIONS.forEach(function (action) { setAction('gamepad', action, false); });
    }
    requestAnimationFrame(pollGamepads);
  }
  requestAnimationFrame(pollGamepads);

  function el(tag, style, parent) {
    var node = document.createElement(tag);
    node.style.cssText = style;
    if (parent) parent.appendChild(node);
    return node;
  }

  function buildUi() {
    ui = el('div', 'position:fixed;inset:0;z-index:900;pointer-events:none;display:none;');
    ui.id = 'mypip-input-ui';
    ui.addEventListener('contextmenu', function (event) { event.preventDefault(); });

    // Dynamic Left Thumb Floating/Stationary Joystick Area
    ui.moveZone = el('div', 'position:absolute;left:0;bottom:0;width:44%;height:80%;pointer-events:auto;touch-action:none;', ui);
    
    // Vedic Compass Base
    var baseStyle = 'position:absolute;border-radius:50%;box-sizing:border-box;' +
      'width:' + (STICK_RADIUS * 2) + 'px;height:' + (STICK_RADIUS * 2) + 'px;' +
      'background:radial-gradient(circle at 50% 50%, rgba(13, 56, 80, 0.72) 0%, rgba(6, 26, 40, 0.90) 100%);' +
      'border:2px solid rgba(245, 197, 99, 0.55);' +
      'box-shadow:0 8px 24px rgba(0,0,0,0.55), inset 0 0 16px rgba(245, 197, 99, 0.2), 0 0 12px rgba(245, 197, 99, 0.3);' +
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);pointer-events:none;transition:opacity 0.2s ease;';
    ui.base = el('div', baseStyle, ui.moveZone);
    
    // Crosshair rings inside base
    ui.crosshair = el('div', 'position:absolute;inset:8px;border-radius:50%;border:1px dashed rgba(245, 197, 99, 0.3);pointer-events:none;', ui.base);

    // Glowing Golden Amber Knob
    var knobSize = 52;
    var knobStyle = 'position:absolute;border-radius:50%;box-sizing:border-box;' +
      'width:' + knobSize + 'px;height:' + knobSize + 'px;' +
      'left:' + (STICK_RADIUS - knobSize / 2) + 'px;top:' + (STICK_RADIUS - knobSize / 2) + 'px;' +
      'background:radial-gradient(circle at 35% 30%, #fff4c2 0%, #f5b041 55%, #bd7311 100%);' +
      'border:2px solid #fff9df;' +
      'box-shadow:0 4px 16px rgba(0,0,0,0.6), 0 0 18px rgba(255, 212, 121, 0.65), inset 0 2px 4px rgba(255,255,255,0.7);' +
      'display:flex;align-items:center;justify-content:center;color:#4a2c00;font-size:16px;font-weight:900;' +
      'pointer-events:none;transition:transform 0.04s ease-out;';
    ui.knob = el('div', knobStyle, ui.base);
    ui.knob.textContent = '✦';

    ui.moveZone.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      stick.pointer = event.pointerId;
      stick.active = true;
      ui.moveZone.setPointerCapture(event.pointerId);
      var zone = ui.moveZone.getBoundingClientRect();
      stick.originX = event.clientX - zone.left;
      stick.originY = event.clientY - zone.top;
      ui.base.style.left = (stick.originX - STICK_RADIUS) + 'px';
      ui.base.style.top = (stick.originY - STICK_RADIUS) + 'px';
      ui.base.style.opacity = '1';
      moveStick(event);
    });

    ui.moveZone.addEventListener('pointermove', function (event) {
      if (event.pointerId === stick.pointer) {
        event.preventDefault();
        event.stopPropagation();
        moveStick(event);
      }
    });

    ['pointerup', 'pointercancel'].forEach(function (type) {
      ui.moveZone.addEventListener(type, function (event) {
        if (event.pointerId !== stick.pointer) return;
        stick.pointer = null;
        stick.active = false;
        stick.x = stick.y = 0;
        ui.knob.style.transform = '';
        placeStick();
      });
    });

    ui.buttons = {};

    // Button A - Primary Action (Draw / Loose)
    var btnA = el('div', '', ui);
    btnA.id = 'mypip-btn-a';
    btnA.dataset.action = 'a';
    var btnAStyle = 'position:absolute;border-radius:50%;box-sizing:border-box;' +
      'width:' + BUTTON_SIZE + 'px;height:' + BUTTON_SIZE + 'px;' +
      'background:radial-gradient(circle at 35% 30%, rgba(255, 230, 160, 0.5) 0%, rgba(220, 145, 24, 0.9) 60%, rgba(138, 80, 5, 0.95) 100%);' +
      'border:2.5px solid rgba(255, 212, 121, 0.9);' +
      'box-shadow:0 6px 22px rgba(0,0,0,0.55), 0 0 20px rgba(245, 197, 99, 0.45), inset 0 2px 4px rgba(255,255,255,0.6);' +
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
      'color:#fff8e7;font:900 15px Cinzel,Georgia,serif;letter-spacing:1.5px;text-transform:uppercase;' +
      'display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;' +
      'pointer-events:auto;cursor:pointer;text-shadow:0 2px 4px rgba(0,0,0,0.8);transition:transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.12s ease;';
    btnA.style.cssText = btnAStyle;

    btnA.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      btnA.setPointerCapture(event.pointerId);
      btnA.style.transform = 'scale(0.92)';
      btnA.style.boxShadow = '0 2px 10px rgba(0,0,0,0.7), 0 0 28px rgba(255, 220, 100, 0.9), inset 0 2px 8px rgba(255,255,255,0.8)';
      btnA.style.borderColor = '#ffffff';
      setAction('touch', 'a', true);
    });

    ['pointerup', 'pointercancel'].forEach(function (type) {
      btnA.addEventListener(type, function (event) {
        event.preventDefault();
        event.stopPropagation();
        btnA.style.transform = '';
        btnA.style.boxShadow = '0 6px 22px rgba(0,0,0,0.55), 0 0 20px rgba(245, 197, 99, 0.45), inset 0 2px 4px rgba(255,255,255,0.6)';
        btnA.style.borderColor = 'rgba(255, 212, 121, 0.9)';
        setAction('touch', 'a', false);
      });
    });
    ui.buttons.a = btnA;

    // Button B - Secondary Action (Astra Switch)
    var btnB = el('div', '', ui);
    btnB.id = 'mypip-btn-b';
    btnB.dataset.action = 'b';
    var btnBStyle = 'position:absolute;border-radius:50%;box-sizing:border-box;' +
      'width:' + SECONDARY_SIZE + 'px;height:' + SECONDARY_SIZE + 'px;' +
      'background:radial-gradient(circle at 35% 30%, rgba(20, 75, 105, 0.88), rgba(9, 35, 50, 0.95));' +
      'border:2px solid rgba(141, 255, 212, 0.7);' +
      'box-shadow:0 4px 16px rgba(0,0,0,0.5), 0 0 14px rgba(141, 255, 212, 0.35);' +
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
      'color:#8dffd4;font:800 13px Cinzel,Georgia,serif;letter-spacing:1px;text-transform:uppercase;' +
      'display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;' +
      'pointer-events:auto;cursor:pointer;text-shadow:0 2px 4px rgba(0,0,0,0.8);transition:transform 0.12s ease, box-shadow 0.12s ease;';
    btnB.style.cssText = btnBStyle;

    btnB.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      btnB.setPointerCapture(event.pointerId);
      btnB.style.transform = 'scale(0.90)';
      btnB.style.boxShadow = '0 2px 8px rgba(0,0,0,0.6), 0 0 22px rgba(141, 255, 212, 0.8)';
      setAction('touch', 'b', true);
    });

    ['pointerup', 'pointercancel'].forEach(function (type) {
      btnB.addEventListener(type, function (event) {
        event.preventDefault();
        event.stopPropagation();
        btnB.style.transform = '';
        btnB.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5), 0 0 14px rgba(141, 255, 212, 0.35)';
        setAction('touch', 'b', false);
      });
    });
    ui.buttons.b = btnB;

    // Pause is handled cleanly by the top-left HUD Back button
    var btnPause = el('div', 'display:none !important;', ui);
    ui.buttons.pause = btnPause;

    document.body.appendChild(ui);
    addEventListener('resize', layout);
  }

  function moveStick(event) {
    var zone = ui.moveZone.getBoundingClientRect();
    var dx = event.clientX - zone.left - stick.originX;
    var dy = event.clientY - zone.top - stick.originY;
    var value = limit({ x: dx / STICK_RADIUS, y: dy / STICK_RADIUS });
    stick.x = value.x;
    stick.y = value.y;
    ui.knob.style.transform = 'translate(' + (value.x * STICK_RADIUS * 0.58) + 'px,' + (value.y * STICK_RADIUS * 0.58) + 'px)';
  }

  function placeStick() {
    if (!ui || !ui.base || !ui.moveZone) return;
    var zone = ui.moveZone.getBoundingClientRect();
    var bottomMargin = Math.max(22, 28);
    var leftMargin = Math.max(24, 28);
    ui.base.style.left = leftMargin + 'px';
    ui.base.style.top = Math.max(10, zone.height - bottomMargin - STICK_RADIUS * 2) + 'px';
    ui.base.style.opacity = '0.78';
  }

  function layout() {
    if (!ui || !config) return;
    var isLandscape = innerWidth > innerHeight;
    ui.moveZone.style.display = config.move ? 'block' : 'none';
    
    // Generous landscape touch zones
    ui.moveZone.style.width = isLandscape ? '44%' : '50%';
    ui.moveZone.style.height = isLandscape ? '80%' : '50%';

    var a = ui.buttons.a, b = ui.buttons.b;
    a.style.display = config.buttons.a ? 'flex' : 'none';
    b.style.display = config.buttons.b ? 'flex' : 'none';

    a.textContent = config.buttons.a || '';
    b.textContent = config.buttons.b || '';

    // Ergonomic landscape phone layout: Primary thumb resting coordinates
    var safeRight = 28;
    var safeBottom = 22;

    a.style.right = safeRight + 'px';
    a.style.bottom = safeBottom + 'px';

    // Button B placed directly above Button A in thumb's upward reach
    b.style.right = (safeRight + 6) + 'px';
    b.style.bottom = (safeBottom + BUTTON_SIZE + 16) + 'px';

    if (!stick.active) placeStick();
  }

  function render() {
    if (!ui) return;
    var show = Boolean(config && controlsShown && (device === 'touch' || checkMobileScreen()));
    ui.style.display = show ? 'block' : 'none';
    layout();
  }

  function whenReady(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  window.MyPipInput = {
    configure: function (options) {
      options = options || {};
      var area = options.moveArea || {};
      config = {
        move: options.move !== false,
        moveArea: { width: 0.44, height: 0.80 },
        look: false,
        buttons: options.buttons || { a: 'Draw' },
        pause: false
      };
      whenReady(function () {
        if (!ui) buildUi();
        render();
      });
    },
    showControls: function (shown) {
      controlsShown = shown !== false;
      render();
    },
    read: function () {
      var move = keyboardMove();
      if (!move.x && !move.y) move = { x: stick.x, y: stick.y };
      if (!move.x && !move.y) move = gamepad.move;
      var state = {
        move: { x: move.x, y: move.y },
        look: { x: 0, y: 0 },
        a: held.a,
        b: held.b,
        pause: held.pause,
        pressed: { a: pressed.a, b: pressed.b, pause: pressed.pause },
        device: device
      };
      pressed = { a: false, b: false, pause: false };
      return state;
    },
    on: function (action, fn) {
      if (!Object.prototype.hasOwnProperty.call(listeners, action)) {
        return function () {};
      }
      listeners[action].push(fn);
      return function () { listeners[action] = listeners[action].filter(function (item) { return item !== fn; }); };
    },
    setAstraVisual: function (name, color) {
      if (ui && ui.buttons && ui.buttons.b) {
        ui.buttons.b.textContent = name;
        ui.buttons.b.style.borderColor = color;
        ui.buttons.b.style.color = color;
        ui.buttons.b.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5), 0 0 16px ' + color;
      }
    },
    get device() { return device; }
  };
})();
