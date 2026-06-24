// ============================================================
        // CONFIGURACIÓN DE GOOGLE SHEETS
        // ============================================================
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRs5YVavWd_cDyO6XRQH38pGRb8ngrvLprE7nOLhS-6m4nT8bQv2JAJY9Xo5Zru-6jTg/exec'; // ← Pega aquí la URL del Web App

        // ============================================================
        // DB — Base de datos con caché local + sync a Google Sheets
        // ============================================================
        const _cache = {};
        let _syncEnabled = false;
        let _syncPending = [];

        const LOGO_ARATECH = 'https://i.imgur.com/o0f9z8p.png';
        const LOGO_ONARA = 'https://i.imgur.com/WrZDkur.png';
        const QR_POLYGAR = 'https://i.imgur.com/9ktQECA.png';
        const LOGO_TALON = 'https://i.imgur.com/9ne032L.png';