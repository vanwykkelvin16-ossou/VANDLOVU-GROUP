CREATE TRIGGER bookings_capacity_insert BEFORE INSERT ON bookings
WHEN NEW.status IN ('Pending','Approved') AND (SELECT count(*) FROM bookings WHERE date=NEW.date AND status IN ('Pending','Approved')) >= 5
BEGIN SELECT RAISE(ABORT,'booking_capacity'); END;
--> statement-breakpoint
CREATE TRIGGER bookings_capacity_update BEFORE UPDATE OF status,date ON bookings
WHEN NEW.status IN ('Pending','Approved') AND (SELECT count(*) FROM bookings WHERE date=NEW.date AND status IN ('Pending','Approved') AND id!=NEW.id) >= 5
BEGIN SELECT RAISE(ABORT,'booking_capacity'); END;
--> statement-breakpoint
CREATE TRIGGER bookings_blocked_insert BEFORE INSERT ON bookings
WHEN EXISTS(SELECT 1 FROM blocks WHERE date=NEW.date)
BEGIN SELECT RAISE(ABORT,'date_blocked'); END;
--> statement-breakpoint
CREATE TRIGGER bookings_status_insert BEFORE INSERT ON bookings
WHEN NEW.status NOT IN ('Pending','Approved','Rejected')
BEGIN SELECT RAISE(ABORT,'invalid_status'); END;
--> statement-breakpoint
CREATE TRIGGER bookings_status_update BEFORE UPDATE OF status ON bookings
WHEN NEW.status NOT IN ('Pending','Approved','Rejected')
BEGIN SELECT RAISE(ABORT,'invalid_status'); END;
