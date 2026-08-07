# PLOS Headache Diary Dataset Analysis Summary

## Source paper
Park JW et al. *Analysis of Trigger Factors in Episodic Migraineurs Using a Smartphone Headache Diary Application*. PLOS ONE. 2016. DOI: 10.1371/journal.pone.0149577.

## Dataset use in this project
The supplementary PLOS headache diary dataset was reviewed as a second dataset for the MSc migraine/headache prediction prototype. The original spreadsheet was mainly in Korean, so an English working copy of key labels and common coded responses was created for analysis.

The dataset is treated separately from the original lifestyle-based migraine dataset because it uses different variables, a different data collection method, and a different prediction target.

## Modelling task
The selected task is headache-day prediction:

- Target 0: headache-free day
- Target 1: headache day

The feature set uses diary trigger and context variables, including internal triggers, environmental triggers, dietary/other triggers, medication use and exercise variables. Post-headache improvement factors were excluded to reduce the risk of data leakage.

## Refined model result
Using an 80:20 stratified split, the strongest refined model was Random Forest:

| Model | Accuracy | Precision | Recall | F1-score | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| Random Forest | 0.8287 | 0.6186 | 0.6000 | 0.6091 | 0.7908 |
| Gradient Boosting | 0.8387 | 0.7236 | 0.4450 | 0.5511 | 0.7890 |
| Logistic Regression | 0.8198 | 0.5922 | 0.6100 | 0.6010 | 0.7773 |

## Benchmark interpretation
The source paper provides a benchmark for dataset context, trigger categories and clinical relevance. It is not a direct machine-learning benchmark for the web prototype because the published study focused on trigger factor analysis rather than deployment of a predictive web tool.

## Web prototype implication
The web tool now presents this as a separate headache diary risk model alongside the original lifestyle-based migraine risk model. This avoids merging incompatible datasets while supporting a broader digital health self-management prototype.
