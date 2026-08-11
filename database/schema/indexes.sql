CREATE INDEX ix_achievements_device ON achievements(device_id);

CREATE INDEX ix_analytics_event ON analytics(event, created_at);

CREATE INDEX ix_bookmarks_device ON bookmarks(device_id);

CREATE INDEX ix_concepts_topic ON concepts(topic_id);

CREATE INDEX ix_ca_period ON current_affairs(period, period_date);

CREATE INDEX ix_flashcards_due ON flashcards(device_id, due_date);

CREATE INDEX ix_history_device ON history(device_id, answered_at);

CREATE INDEX ix_history_device_time ON history(device_id, answered_at);

CREATE INDEX ix_history_mcq    ON history(mcq_id);

CREATE INDEX ix_kg_hist_concept ON kg_concept_history(concept_id);

CREATE INDEX ix_kg_hist_subject ON kg_concept_history(subject_id);

CREATE INDEX ix_kg_rel_from ON kg_concept_relations(from_concept);

CREATE INDEX ix_kg_rel_to ON kg_concept_relations(to_concept);

CREATE INDEX ix_kg_rel_type ON kg_concept_relations(relation_type);

CREATE INDEX ix_kg_stat_concept ON kg_concept_statistics(concept_id);

CREATE INDEX ix_kg_concepts_domain ON kg_concepts(subject_id, domain);

CREATE INDEX ix_kg_concepts_subject ON kg_concepts(subject_id);

CREATE INDEX ix_kg_concepts_topic ON kg_concepts(topic_id);

CREATE INDEX ix_kg_diff_concept ON kg_difficulty_profiles(concept_id);

CREATE INDEX ix_kg_ditem_pool ON kg_distractor_items(pool_id);

CREATE INDEX ix_kg_pool_concept ON kg_distractor_pools(concept_id);

CREATE INDEX ix_kg_pool_subject ON kg_distractor_pools(subject_id);

CREATE INDEX ix_kg_exam_concept ON kg_exam_mappings(concept_id);

CREATE INDEX ix_kg_exam_exam ON kg_exam_mappings(exam_id);

CREATE INDEX ix_kg_exam_objective ON kg_exam_mappings(objective_id);

CREATE INDEX ix_kg_exam_subject ON kg_exam_mappings(subject_id);

CREATE INDEX ix_kg_packs_subject ON kg_knowledge_packs(subject_id);

CREATE INDEX ix_kg_lo_concept ON kg_learning_objectives(concept_id);

CREATE INDEX ix_kg_lo_micro ON kg_learning_objectives(micro_concept_id);

CREATE INDEX ix_kg_lo_subject ON kg_learning_objectives(subject_id);

CREATE INDEX ix_kg_pathstep_path ON kg_learning_path_steps(path_id);

CREATE INDEX ix_kg_path_subject ON kg_learning_paths(subject_id);

CREATE INDEX ix_kg_micro_concept ON kg_micro_concepts(concept_id);

CREATE INDEX ix_kg_micro_subject ON kg_micro_concepts(subject_id);

CREATE INDEX ix_kg_prereq_concept ON kg_prerequisites(concept_id);

CREATE INDEX ix_kg_prereq_requires ON kg_prerequisites(requires_id);

CREATE INDEX ix_kg_bp_concept ON kg_question_blueprints(concept_id);

CREATE INDEX ix_kg_bp_objective ON kg_question_blueprints(objective_id);

CREATE INDEX ix_kg_bp_subject ON kg_question_blueprints(subject_id);

CREATE INDEX ix_kg_bp_type ON kg_question_blueprints(blueprint_type);

CREATE INDEX ix_kg_ref_concept ON kg_reference_sources(concept_id);

CREATE INDEX ix_kg_ref_subject ON kg_reference_sources(subject_id);

CREATE INDEX ix_kg_syllabus_exam ON kg_syllabus_units(exam_id);

CREATE INDEX ix_kg_syllabus_subject ON kg_syllabus_units(subject_id);

CREATE INDEX ix_leaderboard_points ON leaderboard(points DESC);

CREATE INDEX ix_lb_period ON leaderboard_periods(period, period_key, points DESC);

CREATE INDEX ix_sessions_device ON learning_sessions(device_id, started_at);

CREATE INDEX ix_mc_concept ON mcq_concepts(concept_id);

CREATE INDEX ix_mcqs_chapter ON mcqs(chapter_id);

CREATE INDEX ix_mcqs_chapter_status ON mcqs(chapter_id, status);

CREATE INDEX ix_mcqs_diff    ON mcqs(difficulty);

CREATE INDEX ix_mcqs_subject ON mcqs(subject_id);

CREATE INDEX ix_mcqs_subject_status ON mcqs(subject_id, status);

CREATE INDEX ix_mcqs_topic   ON mcqs(topic_id);

CREATE INDEX ix_mcqs_topic_status ON mcqs(topic_id, status);

CREATE INDEX ix_mcqs_year    ON mcqs(year);

CREATE INDEX ix_notifications_device ON notifications(device_id, read);

CREATE INDEX ix_options_mcq ON options(mcq_id);

CREATE INDEX ix_options_mcq_label ON options(mcq_id, label);

CREATE INDEX ix_predictions_device ON predictions(device_id, created_at);

CREATE INDEX ix_recommendations_device ON recommendations(device_id, seen, priority);

CREATE INDEX ix_revision_due ON revision_schedule(device_id, status, due_date);

CREATE INDEX ix_plans_device ON study_plans(device_id, plan_date);

CREATE INDEX ix_weak_priority ON weak_topics(device_id, priority);
