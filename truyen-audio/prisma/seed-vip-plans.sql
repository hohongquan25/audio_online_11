INSERT INTO "VipPlan" (id, name, days, price, description, "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES 
  ('vip-week', 'Gói Tuần', 7, 29000, 'Trải nghiệm VIP 7 ngày', true, 1, NOW(), NOW()),
  ('vip-month', 'Gói Tháng', 30, 79000, 'Phổ biến nhất - 30 ngày VIP', true, 2, NOW(), NOW()),
  ('vip-year', 'Gói Năm', 365, 599000, 'Tiết kiệm nhất - 365 ngày VIP', true, 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
