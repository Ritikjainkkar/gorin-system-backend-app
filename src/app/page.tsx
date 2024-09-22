import Image from "next/image";
import styles from "./page.module.css";
import PropertyHighlights from "@/components/PropertyHighlights";

export default function Home() {
  return (
    <div className={styles.page}>
      <PropertyHighlights />
    </div>
  );
}
