"use client";

import { useState } from "react";
import type { FaqItem } from "@/config/faq";
import { trackEvent } from "@/lib/analytics";
import { ChevronDownIcon } from "./Icons";
import styles from "./Accordion.module.css";

interface AccordionProps {
  items: readonly FaqItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => {
      const next = prev === id ? null : id;
      if (next) {
        trackEvent("faq_opened", { faq_id: id });
      }
      return next;
    });
  };

  return (
    <div className={styles.list}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const triggerId = `${item.id}-trigger`;
        const panelId = `${item.id}-panel`;

        return (
          <div key={item.id} className={styles.item}>
            <h3>
              <button
                id={triggerId}
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
              >
                <span>{item.question}</span>
                <ChevronDownIcon
                  className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`.trim()}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className={`type-body-large ${styles.panel}`}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

