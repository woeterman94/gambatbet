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

    function readNumber(key, fallback) {
        return toAmount(read(key), fallback);
    }

    function queryNumber(name) {
        try {
            var value = new URLSearchParams(window.location.search).get(name);
            if (value === null) {
                return null;
            }
            var amount = Number(value);
            return Number.isFinite(amount) ? amount : null;
        } catch (error) {
            return null;
        }
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
            var creditKey = buildKey(gameId, 'credit');
            var queryCredit = queryNumber('credit');
            if (queryCredit !== null) {
                var seededCredit = toAmount(queryCredit, startingCredit);
                write(creditKey, String(seededCredit));
                return seededCredit;
            }

            var storedCredit = read(creditKey);
            if (storedCredit !== null) {
                return readNumber(creditKey, startingCredit);
            }

            return startingCredit;
        },
        setCredit: function (gameId, value) {
            var currentCredit = this.getCredit(gameId);
            write(buildKey(gameId, 'credit'), String(toAmount(value, currentCredit)));
        },
        setStake: function (gameId, value) {
            write(buildKey(gameId, 'stake'), String(toAmount(value, 0)));
        },
        getStake: function (gameId) {
            return readNumber(buildKey(gameId, 'stake'), 0);
        },
        getBetLimits: function (gameId, defaults) {
            var minFallback = defaults && typeof defaults.min === 'number' ? defaults.min : 1;
            var maxFallback = defaults && typeof defaults.max === 'number' ? defaults.max : 100;
            var minQuery = queryNumber('minBet');
            var maxQuery = queryNumber('maxBet');
            var minKey = buildKey(gameId, 'minBet');
            var maxKey = buildKey(gameId, 'maxBet');

            if (minQuery !== null) {
                write(minKey, String(toAmount(minQuery, minFallback)));
            }

            if (maxQuery !== null) {
                write(maxKey, String(toAmount(maxQuery, maxFallback)));
            }

            var resolvedMin = readNumber(minKey, minFallback);
            var resolvedMax = readNumber(maxKey, maxFallback);

            return {
                min: Math.min(resolvedMin, resolvedMax),
                max: Math.max(resolvedMin, resolvedMax)
            };
        },
        resetCredit: function (gameId, fallback) {
            this.setCredit(gameId, typeof fallback === 'number' ? fallback : DEFAULT_CREDIT);
        }
    };
}(window));
