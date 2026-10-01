import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ChecklistItem } from "@/types/checklist";

interface ProspectChecklistProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  allowEdit?: boolean;
}

export function ProspectChecklist({ items, onItemsChange, allowEdit = false }: ProspectChecklistProps) {
  const [newLabel, setNewLabel] = useState("");

  const addChecklistItem = () => {
    if (!newLabel.trim()) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      response: "",
    };
    onItemsChange([...items, newItem]);
    setNewLabel("");
  };

  const removeChecklistItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const updateChecklistResponse = (id: string, response: string) => {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, response } : item))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex-1 grid gap-1.5">
              <label className="text-sm font-medium">{item.label}</label>
              <Input
                placeholder="Votre réponse..."
                value={item.response || ""}
                onChange={(e) => updateChecklistResponse(item.id, e.target.value)}
                className="text-sm"
              />
            </div>
            {allowEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeChecklistItem(item.id)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {allowEdit && (
          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Nouveau critère..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
              className="flex-1"
            />
            <Button onClick={addChecklistItem} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
