(function (window) {
    var DEFAULT_CREDIT = 1000;
    var fallbackStore = {};

    function storageAvailable() {
        try {
            var testKey = '__virtual_game_test__';
            window.localStorage.setItem(testKey, testKey);
            window.localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    var hasLocalStorage = storageAvailable();

    function buildKey(gameId, suffix) {
        return 'virtual:' + gameId + ':' + suffix;
    }

    function read(key) {
        if (hasLocalStorage) {
            return window.localStorage.getItem(key);
        }
        return Object.prototype.hasOwnProperty.call(fallbackStore, key) ? fallbackStore[key] : null;
    }

    function write(key, value) {
        if (hasLocalStorage) {
            window.localStorage.setItem(key, value);
            return;
        }
        fallbackStore[key] = value;
    }

    function toAmount(value, fallback) {
        var amount = Number(value);
        if (!Number.isFinite(amount) || amount < 0) {
            return fallback;
        }
        return Math.round(amount * 100) / 100;
    }

    window.VirtualGameStore = {
        getCredit: function (gameId, fallback) {
            var startingCredit = typeof fallback === 'number' ? fallback : DEFAULT_CREDIT;
            return toAmount(read(buildKey(gameId, 'credit')), startingCredit);
        },
        setCredit: function (gameId, value) {
            write(buildKey(gameId, 'credit'), String(toAmount(value, DEFAULT_CREDIT)));
        },
        setStake: function (gameId, value) {
            write(buildKey(gameId, 'stake'), String(toAmount(value, 0)));
        },
        getStake: function (gameId) {
            return toAmount(read(buildKey(gameId, 'stake')), 0);
        },
        resetCredit: function (gameId, fallback) {
            this.setCredit(gameId, typeof fallback === 'number' ? fallback : DEFAULT_CREDIT);
        }
    };
}(window));
