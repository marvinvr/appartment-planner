import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  pdfPath: text("pdf_path"),
  pdfWidthPx: integer("pdf_width_px"),
  pdfHeightPx: integer("pdf_height_px"),
  calX1: real("cal_x1"),
  calY1: real("cal_y1"),
  calX2: real("cal_x2"),
  calY2: real("cal_y2"),
  calRealCm: real("cal_real_cm"),
  pixelsPerCm: real("pixels_per_cm"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const furnitureItems = sqliteTable("furniture_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  widthCm: real("width_cm").notNull(),
  heightCm: real("height_cm").notNull(),
  color: text("color").notNull().default("#93c5fd"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const layouts = sqliteTable("layouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const placements = sqliteTable("placements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  layoutId: integer("layout_id")
    .notNull()
    .references(() => layouts.id, { onDelete: "cascade" }),
  furnitureItemId: integer("furniture_item_id")
    .notNull()
    .references(() => furnitureItems.id, { onDelete: "cascade" }),
  xPx: real("x_px").notNull(),
  yPx: real("y_px").notNull(),
  rotationDeg: real("rotation_deg").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
