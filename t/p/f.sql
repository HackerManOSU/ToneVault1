DELIMITER //
CREATE TRIGGER update_guitar_timestamp
BEFORE UPDATE ON Guitar
FOR EACH ROW
BEGIN
    SET NEW.last_modified = CURRENT_TIMESTAMP;
END;//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE get_guitars_by_genre(IN genre_name VARCHAR(50))
BEGIN
    SELECT 
        g.guitar_id,
        g.brand,
        g.model,
        g.year,
        g.serial_number,
        g.genre,
        g.body_type,
        p.photo_id,
        p.caption,
        u.user_id,
        u.username
    FROM Guitar g
    LEFT JOIN Photos p ON g.photo_id = p.photo_id
    JOIN User u ON g.user_id = u.user_id
    WHERE g.genre = genre_name
    ORDER BY g.brand, g.model;
END//
DELIMITER ;

DELIMITER //
CREATE FUNCTION count_user_guitars(user_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE guitar_count INT;
    SELECT COUNT(*) INTO guitar_count
    FROM Guitar 
    WHERE user_id = user_id;
    RETURN guitar_count;
END//
DELIMITER ;