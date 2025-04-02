import GenerateTerminalCommand from "./cmd";
import CommitMessageCommand from "./commit";
import DraftIssueCommand from "./draftIssue";
import HttpSlashCommand from "./http";
import ImpactAnalysisSlashCommand from "./impact-analysis";
import OnboardSlashCommand from "./onboard";
import ProjectFlowSlashCommand from "./project-flow";
import ReviewMessageCommand from "./review/review";
import ReviewCodebaseMessageCommand from "./review/review-codebase";
import ReviewHelpCommand from "./review/review-help";
import ReviewStageDifferenceCommand from "./review/review-stage";
import ReviewStageDifferenceCommentsCommand from "./review/review-stage-comments";
import ReviewStageDifferenceComplianceCommand from "./review/review-stage-compliance";
import ReviewStageDifferenceDuplicationCommand from "./review/review-stage-duplications";
import ReviewStageDifferenceLoggingCommand from "./review/review-stage-logging";
import ReviewStageDifferenceMemoryLeaksCommand from "./review/review-stage-memory-leaks";
import ReviewStageDifferenceNamingConventionCommand from "./review/review-stage-naming-convention";
import ReviewStageDifferenceRefactoringCommand from "./review/review-stage-refactoring";
import ShareSlashCommand from "./share";

export default [
  DraftIssueCommand,
  ShareSlashCommand,
  GenerateTerminalCommand,
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
  ImpactAnalysisSlashCommand,
  ProjectFlowSlashCommand,
];
