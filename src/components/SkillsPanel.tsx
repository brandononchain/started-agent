import { useState, useEffect, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import "./Panels.css";
import "./SkillsPanel.css";

type Skill = { id?: string; name?: string; enabled?: boolean; [k: string]: unknown };

export function SkillsPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gatewayClient.skillsList().catch(() => ({ skills: [] }));
      const list = res?.skills;
      setSkills(Array.isArray(list) ? (list as Skill[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await gatewayClient.skillsEnable({ id, enabled });
      await load();
    } catch (_) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <p>Loading skills…</p>
      </div>
    );
  }

  return (
    <div className="skills-panel">
      <div className="panel-toolbar">
        <h2>Skills</h2>
        <button type="button" className="btn btn-secondary" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <div className="panel-error-inline">{error}</div>}
      {skills.length === 0 ? (
        <p className="panel-empty">No skills listed. Use StartedAI CLI to install skills.</p>
      ) : (
        <ul className="skills-list">
          {skills.map((skill) => (
            <li key={skill.id ?? skill.name ?? Math.random()} className="skill-item">
              <span className="skill-name">{skill.name ?? skill.id ?? "—"}</span>
              <label className="skill-toggle">
                <input
                  type="checkbox"
                  checked={skill.enabled !== false}
                  onChange={(e) => handleToggle(String(skill.id ?? skill.name), e.target.checked)}
                />
                Enabled
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
