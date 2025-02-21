import GenerateTerminalCommand from "./cmd";
import CommitMessageCommand from "./commit";
import DraftIssueCommand from "./draftIssue";
import HttpSlashCommand from "./http";
import OnboardSlashCommand from "./onboard";
import ReviewMessageCommand from "./review/review";
import ReviewCodebaseMessageCommand from "./review/review-codebase";
import ShareSlashCommand from "./share";
import GitAddAllCommand from "./git-add";
import GitCommitCommand from "./git-commit";
import ProjectFlowSlashCommand from "./project-flow";
import CreateReadmeSlashCommand from "./create-readme";
import ImpactAnalysisSlashCommand from "./impact-analysis";
import CreateCodeStatsCommand from "./code-stats";
import ReviewStageDifferenceCommand from "./review/review-stage";
import ReviewStageDifferenceNamingConventionCommand from "./review/review-stage-naming-convention";
import ReviewStageDifferenceDuplicationCommand from "./review/review-stage-duplications";
import ReviewStageDifferenceCommentsCommand from "./review/review-stage-comments";
import ReviewStageDifferenceMemoryLeaksCommand from "./review/review-stage-memory-leaks";
import ReviewStageDifferenceComplianceCommand from "./review/review-stage-compliance";
import ReviewStageDifferenceLoggingCommand from "./review/review-stage-logging";
import ReviewStageDifferenceRefactoringCommand from "./review/review-stage-refactoring";
import ReviewHelpCommand from "./review/review-help";

export default [
  DraftIssueCommand,
  ShareSlashCommand,
  GenerateTerminalCommand,
  GitAddAllCommand,
  GitCommitCommand,
  HttpSlashCommand,
  CommitMessageCommand,
  ReviewMessageCommand,
  ReviewHelpCommand,
  ReviewCodebaseMessageCommand,
  ReviewStageDifferenceCommand,
  ReviewStageDifferenceNamingConventionCommand,
  ReviewStageDifferenceDuplicationCommand,
  ReviewStageDifferenceCommentsCommand,
  ReviewStageDifferenceMemoryLeaksCommand,
  ReviewStageDifferenceComplianceCommand,
  ReviewStageDifferenceLoggingCommand,
  ReviewStageDifferenceRefactoringCommand,
  OnboardSlashCommand,
  ProjectFlowSlashCommand,
  CreateReadmeSlashCommand,
  ImpactAnalysisSlashCommand,
  CreateCodeStatsCommand,
];
