import { useEffect, useState } from "react";
import { Plus, Search, AlertTriangle, Clock, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/services/api";

interface MaintenanceRecord {
  id: string;
  asset_id: string;
  maintenance_type: string;
  description: string;
  priority: string;
  status: string;
  estimated_cost?: number;
  actual_cost?: number;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  assigned_contractor?: string;
  created_at: string;
}

export function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const loadMaintenance = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<{ 
          total: number; 
          limit: number; 
          offset: number; 
          maintenance: MaintenanceRecord[] 
        }>("/api/v1/maintenance?limit=100");
        setMaintenance(response.maintenance || []);
      } catch (error) {
        console.error("Failed to load maintenance records", error);
        setMaintenance([]);
      } finally {
        setLoading(false);
      }
    };

    void loadMaintenance();
  }, []);

  const filtered = maintenance.filter((m) => {
    const matchesSearch =
      m.asset_id.toLowerCase().includes(search.toLowerCase()) ||
      m.maintenance_type.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Completed</span>;
      case "in_progress":
        return <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">In Progress</span>;
      case "planned":
        return <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Planned</span>;
      case "overdue":
        return <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Overdue</span>;
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Urgent</span>;
      case "high":
        return <span className="rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">High</span>;
      case "medium":
        return <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Medium</span>;
      case "low":
        return <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Low</span>;
      default:
        return <span className="text-xs">{priority}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance</h1>
            <p className="text-sm text-muted-foreground">Manage asset maintenance and work orders</p>
          </div>
          <Button>
            <Plus className="mr-2 size-4" />
            New Maintenance
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by asset, type, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["", "planned", "in_progress", "completed", "overdue"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                    statusFilter === status
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {status || "All Status"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading maintenance records...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No maintenance records found</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="cursor-pointer rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-semibold">{record.asset_id}</p>
                        <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {record.maintenance_type}
                        </span>
                        {getStatusBadge(record.status)}
                        {getPriorityBadge(record.priority)}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm">{record.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {record.estimated_cost && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="size-3.5" />
                            Est: ₹{record.estimated_cost.toLocaleString()}
                          </div>
                        )}
                        {record.assigned_contractor && (
                          <div>Assigned to: {record.assigned_contractor}</div>
                        )}
                        {record.planned_start_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            Start: {new Date(record.planned_start_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedRecord && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Maintenance Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-semibold text-muted-foreground">Asset ID</dt>
                <dd className="mt-1">{selectedRecord.asset_id}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Type</dt>
                <dd className="mt-1">{selectedRecord.maintenance_type}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Status</dt>
                <dd className="mt-1">{getStatusBadge(selectedRecord.status)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Priority</dt>
                <dd className="mt-1">{getPriorityBadge(selectedRecord.priority)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Estimated Cost</dt>
                <dd className="mt-1">{selectedRecord.estimated_cost ? `₹${selectedRecord.estimated_cost.toLocaleString()}` : "N/A"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Actual Cost</dt>
                <dd className="mt-1">{selectedRecord.actual_cost ? `₹${selectedRecord.actual_cost.toLocaleString()}` : "N/A"}</dd>
              </div>
              {selectedRecord.assigned_contractor && (
                <div>
                  <dt className="font-semibold text-muted-foreground">Assigned To</dt>
                  <dd className="mt-1">{selectedRecord.assigned_contractor}</dd>
                </div>
              )}
              {selectedRecord.planned_start_date && (
                <div>
                  <dt className="font-semibold text-muted-foreground">Planned Start</dt>
                  <dd className="mt-1">{new Date(selectedRecord.planned_start_date).toLocaleString()}</dd>
                </div>
              )}
              {selectedRecord.actual_completion_date && (
                <div>
                  <dt className="font-semibold text-muted-foreground">Completed</dt>
                  <dd className="mt-1">{new Date(selectedRecord.actual_completion_date).toLocaleString()}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4">
              <dt className="font-semibold text-muted-foreground">Description</dt>
              <dd className="mt-1">{selectedRecord.description}</dd>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
