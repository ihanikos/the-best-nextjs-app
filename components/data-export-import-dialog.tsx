"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  FileUp,
  Eye,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Project, TeamMember } from "@/lib/projects/types";
import {
  exportToJSON,
  downloadJSON,
  exportProjectsToCSV,
  exportTeamToCSV,
  downloadCSV,
  parseJSONFile,
  parseCSVFile,
  validateImportData,
  generateProjectFromImport,
  generateTeamMemberFromImport,
  ExportData,
} from "@/lib/data-import-export";

interface DataExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  teamMembers: TeamMember[];
  onImportProjects?: (projects: Partial<Project>[]) => void;
  onImportTeamMembers?: (members: Partial<TeamMember>[]) => void;
}

type ExportFormat = "json" | "csv-projects" | "csv-team";
type ImportStep = "upload" | "preview" | "confirm" | "processing" | "complete";

export function DataExportImportDialog({
  open,
  onOpenChange,
  projects,
  teamMembers,
  onImportProjects,
  onImportTeamMembers,
}: DataExportImportDialogProps) {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const [importStep, setImportStep] = useState<ImportStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ExportData | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState({
    projectsImported: 0,
    teamMembersImported: 0,
  });

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setExportProgress(i);
      }

      if (exportFormat === "json") {
        const data = exportToJSON(projects, teamMembers);
        downloadJSON(data);
        toast.success(`Exported ${projects.length} projects and ${teamMembers.length} team members`);
      } else if (exportFormat === "csv-projects") {
        const csv = exportProjectsToCSV(projects);
        downloadCSV(csv, `nexus-projects-${new Date().toISOString().split("T")[0]}.csv`);
        toast.success(`Exported ${projects.length} projects to CSV`);
      } else if (exportFormat === "csv-team") {
        const csv = exportTeamToCSV(teamMembers);
        downloadCSV(csv, `nexus-team-${new Date().toISOString().split("T")[0]}.csv`);
        toast.success(`Exported ${teamMembers.length} team members to CSV`);
      }

      onOpenChange(false);
    } catch (error) {
      toast.error("Export failed: " + (error as Error).message);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportStep("preview");
    setImportErrors([]);
    setImportWarnings([]);

    try {
      let data: ExportData | null = null;

      if (file.name.endsWith(".json")) {
        data = await parseJSONFile(file);
      } else if (file.name.endsWith(".csv")) {
        const rows = await parseCSVFile(file);
        // Convert CSV rows to project or team member format based on content
        const isTeamData = rows.length > 0 && (rows[0].email || rows[0].role);
        
        if (isTeamData) {
          const importedMembers = rows.map((row) =>
            generateTeamMemberFromImport(row, teamMembers)
          );
          data = {
            version: "1.0.0",
            exportedAt: new Date().toISOString(),
            projects: [],
            teamMembers: importedMembers as TeamMember[],
          };
        } else {
          const importedProjects = rows.map((row) =>
            generateProjectFromImport(row, projects)
          );
          data = {
            version: "1.0.0",
            exportedAt: new Date().toISOString(),
            projects: importedProjects as Project[],
            teamMembers: [],
          };
        }
      }

      if (data) {
        const validation = validateImportData(data);
        
        if (!validation.valid) {
          setImportErrors(validation.errors);
        }

        // Check for duplicates
        if (data.projects) {
          const duplicateProjects = data.projects.filter((p) =>
            projects.some((existing) => existing.id === p.id || existing.name === p.name)
          );
          if (duplicateProjects.length > 0) {
            setImportWarnings((prev) => [
              ...prev,
              `${duplicateProjects.length} project(s) may already exist`,
            ]);
          }
        }

        if (data.teamMembers) {
          const duplicateMembers = data.teamMembers.filter((m) =>
            teamMembers.some((existing) => existing.email === m.email)
          );
          if (duplicateMembers.length > 0) {
            setImportWarnings((prev) => [
              ...prev,
              `${duplicateMembers.length} team member(s) may already exist`,
            ]);
          }
        }

        setImportPreview(data);
      }
    } catch (error) {
      setImportErrors(["Failed to parse file: " + (error as Error).message]);
      setImportStep("upload");
    }
  }, [projects, teamMembers]);

  const handleImport = async () => {
    if (!importPreview) return;

    setImportStep("processing");
    setImportProgress(0);

    try {
      const projectsToImport = importPreview.projects || [];
      const membersToImport = importPreview.teamMembers || [];
      const totalItems = projectsToImport.length + membersToImport.length;
      let processedItems = 0;

      // Import projects
      if (projectsToImport.length > 0 && onImportProjects) {
        onImportProjects(projectsToImport);
        processedItems += projectsToImport.length;
        setImportProgress(Math.round((processedItems / totalItems) * 100));
      }

      // Import team members
      if (membersToImport.length > 0 && onImportTeamMembers) {
        onImportTeamMembers(membersToImport);
        processedItems += membersToImport.length;
        setImportProgress(100);
      }

      setImportStats({
        projectsImported: projectsToImport.length,
        teamMembersImported: membersToImport.length,
      });

      setImportStep("complete");
      toast.success(
        `Imported ${projectsToImport.length} projects and ${membersToImport.length} team members`
      );
    } catch (error) {
      toast.error("Import failed: " + (error as Error).message);
      setImportStep("preview");
    }
  };

  const resetImport = () => {
    setImportStep("upload");
    setSelectedFile(null);
    setImportPreview(null);
    setImportErrors([]);
    setImportWarnings([]);
    setImportProgress(0);
    setImportStats({ projectsImported: 0, teamMembersImported: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Data Export / Import
          </DialogTitle>
          <DialogDescription>
            Export your data for backup or import data from other sources
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "export" | "import")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    exportFormat === "json"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setExportFormat("json")}
                >
                  <FileJson className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">JSON Export</p>
                    <p className="text-sm text-muted-foreground">
                      Complete backup with all data including tasks and settings
                    </p>
                  </div>
                  {exportFormat === "json" && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    exportFormat === "csv-projects"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setExportFormat("csv-projects")}
                >
                  <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                  <div className="flex-1">
                    <p className="font-medium">CSV - Projects Only</p>
                    <p className="text-sm text-muted-foreground">
                      Export projects in CSV format for spreadsheet applications
                    </p>
                  </div>
                  {exportFormat === "csv-projects" && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    exportFormat === "csv-team"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setExportFormat("csv-team")}
                >
                  <FileSpreadsheet className="h-8 w-8 text-orange-500" />
                  <div className="flex-1">
                    <p className="font-medium">CSV - Team Only</p>
                    <p className="text-sm text-muted-foreground">
                      Export team members in CSV format
                    </p>
                  </div>
                  {exportFormat === "csv-team" && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projects</span>
                    <Badge variant="secondary">{projects.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Members</span>
                    <Badge variant="secondary">{teamMembers.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tasks</span>
                    <Badge variant="secondary">
                      {projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0)}
                    </Badge>
                  </div>
                </div>

                {isExporting && (
                  <div className="mt-4 space-y-2">
                    <Progress value={exportProgress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      Exporting... {exportProgress}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting} className="gap-2">
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <AnimatePresence mode="wait">
              {importStep === "upload" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept=".json,.csv"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="import-file"
                        />
                        <label htmlFor="import-file" className="cursor-pointer">
                          <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="font-medium mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground">
                            Supports JSON and CSV files
                          </p>
                        </label>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">Supported formats:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-center gap-2">
                            <FileJson className="h-4 w-4" />
                            JSON exports from Nexus
                          </li>
                          <li className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            CSV with project or team data
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {importStep === "preview" && importPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {importErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {importErrors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {importWarnings.length > 0 && (
                    <Alert className="border-amber-500/50 bg-amber-500/10">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {importWarnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Import Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm">Projects to import</span>
                          <Badge>{importPreview.projects?.length || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm">Team members to import</span>
                          <Badge>{importPreview.teamMembers?.length || 0}</Badge>
                        </div>
                        {importPreview.version && (
                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-sm">Export version</span>
                            <Badge variant="outline">{importPreview.version}</Badge>
                          </div>
                        )}
                      </div>

                      {importPreview.projects && importPreview.projects.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Sample Projects:</p>
                          <div className="space-y-2">
                            {importPreview.projects.slice(0, 3).map((project, i) => (
                              <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                <span className="font-medium">{project.name}</span>
                                <span className="text-muted-foreground ml-2">
                                  ({project.tasks?.length || 0} tasks)
                                </span>
                              </div>
                            ))}
                            {importPreview.projects.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{importPreview.projects.length - 3} more projects
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetImport}>
                      Back
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={importErrors.length > 0 || (!onImportProjects && !onImportTeamMembers)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Import Data
                    </Button>
                  </div>
                </motion.div>
              )}

              {importStep === "processing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="font-medium mb-2">Importing data...</p>
                  <Progress value={importProgress} className="h-2 max-w-xs mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">{importProgress}%</p>
                </motion.div>
              )}

              {importStep === "complete" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <p className="font-medium mb-2">Import Complete!</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{importStats.projectsImported} projects imported</p>
                    <p>{importStats.teamMembersImported} team members imported</p>
                  </div>
                  <Button
                    className="mt-6"
                    onClick={() => {
                      resetImport();
                      onOpenChange(false);
                    }}
                  >
                    Done
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
