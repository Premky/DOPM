import React, { useState } from "react";
import { Stack, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Recursive Sortable Item
function SortableItem({ menu, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 4,
    border: "1px solid #eee",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#fff",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <span {...listeners}>{menu.title}</span> {/* Only title is draggable */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            // console.log("Edit clicked!"); // ✅ Now it will log
            onEdit(menu);
          }}
        >
          <Edit fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(menu.id);
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Stack>

      {menu.children?.map((child) => (
        <SortableItem
          key={child.id}
          menu={child}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}


export default function MenuTree({ menus, setMenus, onEdit, onDelete }) {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      setMenus(arrayMove(menus, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={menus.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        {menus.map((menu) => (
          <SortableItem
            key={menu.id}
            menu={menu}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>

      <DragOverlay>
        {activeId && (
          <div style={{ padding: 8, backgroundColor: "#ddd", borderRadius: 4 }}>
            {menus.find((m) => m.id === activeId)?.title || ""}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
