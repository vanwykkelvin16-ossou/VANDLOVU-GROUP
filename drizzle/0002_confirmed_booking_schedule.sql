-- Confirmed alternate working days, beginning Monday 28 September 2026.
-- Preserve any schedule already configured by the administrator.
INSERT INTO settings(id,mode,anchor) VALUES(1,'alternating','2026-09-28')
ON CONFLICT(id) DO UPDATE SET mode=excluded.mode,anchor=excluded.anchor
WHERE settings.mode='unconfigured';
