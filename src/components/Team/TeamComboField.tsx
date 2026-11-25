import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { normalizeSearch } from "../../../shared/team-options.js";

export interface ComboOption {
  id: string;
  title: string;
  status?: string;
  keywords?: string;
}

export interface ComboGroup {
  title?: string;
  options: ComboOption[];
}

export default function TeamComboField({
  label,
  name,
  value,
  onChange,
  onBlurValue,
  groups,
  normalize = normalizeSearch,
  exactMatch,
  placeholder,
  required = false,
  optional = false,
  fullWidth = false,
  maxLength = 120,
  listLabel,
  openLabel,
  closeLabel,
  hint,
  allowCustom = true,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlurValue?: () => void;
  groups: ComboGroup[];
  normalize?: (value: string) => string;
  exactMatch?: (value: string) => ComboOption | undefined;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  fullWidth?: boolean;
  maxLength?: number;
  listLabel?: string;
  openLabel?: string;
  closeLabel?: string;
  hint?: string;
  allowCustom?: boolean;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);

  const allOptions = groups.flatMap((group) => group.options);
  const findExact =
    exactMatch ||
    ((raw: string) => {
      const normalized = normalize(raw);
      return normalized
        ? allOptions.find((option) => normalize(option.title) === normalized)
        : undefined;
    });

  const words = normalize(query).split(" ").filter(Boolean);
  const filteredGroups = groups
    .map((group) => ({
      title: group.title,
      options: group.options.filter((option) => {
        const searchable = normalize(
          [option.title, group.title, option.status, option.keywords].join(" "),
        );
        return words.every((word) => searchable.includes(word));
      }),
    }))
    .filter((group) => group.options.length > 0);

  const custom =
    allowCustom && query.trim() && !findExact(query)
      ? { id: "custom", title: query.trim() }
      : null;
  const options = filteredGroups.flatMap((group) => group.options);
  if (custom) options.push(custom);
  const current = options[active];
  const selected = findExact(value);
  const activeId = open && current ? `${id}-${current.id}` : undefined;

  useEffect(() => {
    if (activeId) {
      document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
    }
  }, [activeId]);

  function measurePlacement() {
    const control = input.current;
    if (!control) return;
    const rect = control.getBoundingClientRect();
    if (rect.height === 0) return;
    const dialog = control.closest("dialog");
    const bounds = dialog
      ? dialog.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight };
    const spaceBelow = bounds.bottom - rect.bottom - 76;
    const spaceAbove = rect.top - bounds.top - 68;
    setOpenUp(spaceBelow < 220 && spaceAbove > spaceBelow);
  }

  function showAll() {
    measurePlacement();
    setQuery("");
    setActive(-1);
    setOpen(true);
  }

  function choose(option: ComboOption) {
    onChange(option.title);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const down = event.key === "ArrowDown";
      if (!open) {
        showAll();
        setActive(down ? 0 : Math.max(0, allOptions.length - 1));
      } else if (down) {
        setActive(Math.min(active + 1, options.length - 1));
      } else {
        setActive(active < 0 ? options.length - 1 : Math.max(0, active - 1));
      }
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      if (current) choose(current);
      else setOpen(false);
    }
  }

  function renderOption(option: ComboOption) {
    const isSelected =
      option.id === (selected?.id || (custom && !selected ? "custom" : undefined));
    return (
      <div
        key={option.id}
        id={`${id}-${option.id}`}
        role="option"
        aria-selected={isSelected}
        className={`team-combo-option${current?.id === option.id ? " team-combo-active" : ""}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => choose(option)}
      >
        <span>
          {option.id === "custom" ? `استخدام «${option.title}»` : option.title}
        </span>
        {option.status ? (
          <small>{option.status}</small>
        ) : (
          isSelected &&
          option.id !== "custom" && (
            <Check size={15} className="team-combo-check" aria-hidden="true" />
          )
        )}
      </div>
    );
  }

  return (
    <div
      className={`team-field team-combo-field${fullWidth ? " team-field-full" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          onBlurValue?.();
        }
      }}
    >
      <label htmlFor={id}>
        {label}
        {required ? " *" : ""}
        {optional && <> <small>اختياري</small></>}
      </label>
      <div className="team-combo-input">
        <input
          ref={input}
          id={id}
          name={name}
          required={required}
          role="combobox"
          aria-controls={`${id}-list`}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-describedby={hintId}
          autoComplete="off"
          maxLength={maxLength}
          value={value}
          placeholder={placeholder}
          onFocus={showAll}
          onClick={() => {
            if (!open) showAll();
          }}
          onChange={(event) => {
            measurePlacement();
            onChange(event.target.value);
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          className="team-combo-toggle"
          aria-label={open ? closeLabel || `إغلاق قائمة ${label}` : openLabel || `عرض خيارات ${label}`}
          aria-controls={`${id}-list`}
          aria-expanded={open}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) setOpen(false);
            else {
              input.current?.focus();
              showAll();
            }
          }}
        >
          <ChevronDown size={18} aria-hidden="true" />
        </button>
        <div
          id={`${id}-list`}
          role="listbox"
          aria-label={listLabel || label}
          className={`team-combo-list${openUp ? " team-combo-list-up" : ""}`}
          hidden={!open}
        >
          {open &&
            filteredGroups.map((group, index) =>
              group.title ? (
                <div key={group.title} role="group" aria-label={group.title}>
                  <p className="team-combo-group" aria-hidden="true">
                    {group.title}
                  </p>
                  {group.options.map(renderOption)}
                </div>
              ) : (
                <Fragment key={index}>{group.options.map(renderOption)}</Fragment>
              ),
            )}
          {open && custom && renderOption(custom)}
        </div>
      </div>
      {hint && <small id={hintId}>{hint}</small>}
      {!open && selected?.status && <small>{selected.status}</small>}
    </div>
  );
}
