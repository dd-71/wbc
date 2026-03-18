import {
  MdAdd,
  MdDelete,
  MdDragIndicator,
} from "react-icons/md";

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryColor outline-none text-sm ${className}`}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryColor outline-none text-sm resize-none ${className}`}
  />
);

const DynamicList = ({ label, icon: Icon, items, onChange, fields }) => {
  const add = () =>
    onChange([...items, Object.fromEntries(fields.map((f) => [f.key, ""]))]);

  const remove = (i) =>
    onChange(items.filter((_, idx) => idx !== i));

  const update = (i, key, val) =>
    onChange(
      items.map((item, idx) =>
        idx === i ? { ...item, [key]: val } : item
      )
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Icon size={16} className="text-primaryColor" /> {label}
        </p>
        <button
          type="button"
          onClick={add}
          className="px-3 py-1 text-xs bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded flex items-center gap-1"
        >
          <MdAdd size={13} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border"
          >
            <MdDragIndicator size={16} className="text-slate-300 mt-2" />

            <div className="flex-1 grid gap-2">
              {fields.map((f) =>
                f.type === "select" ? (
                  <select
                    key={f.key}
                    value={item[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-primaryColor outline-none text-sm"
                  >
                    <option value="">Select type</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <Textarea
                    key={f.key}
                    rows={2}
                    placeholder={f.placeholder}
                    value={item[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    key={f.key}
                    placeholder={f.placeholder}
                    value={item[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                  />
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => remove(i)}
              className="p-1.5 border rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400"
            >
              <MdDelete size={15} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-xs border border-dashed rounded-lg bg-slate-50">
            No {label.toLowerCase()} added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicList