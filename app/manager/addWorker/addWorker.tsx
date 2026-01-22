// app/manager/addWorker/addWorker.tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, AlertCircle, CheckCircle } from "lucide-react";

// Validation schema
const workerSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["engineer", "worker"], {
    errorMap: () => ({ message: "Role must be either engineer or worker" }),
  }),
});

const formSchema = z.object({
  workers: z.array(workerSchema).min(1, "At least one worker is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddWorkerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workers: [
        {
          email: "",
          fullName: "",
          phone: "",
          password: "",
          role: "worker",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "workers",
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let successCount = 0;
      const errors: string[] = [];

      for (const worker of data.workers) {
        try {
          const res = await fetch("/api/admin/create-worker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(worker),
          });

          if (!res.ok) {
            const err = await res.json();
            errors.push(`${worker.email}: ${err.error}`);
            continue;
          }

          successCount++;
        } catch (err) {
          errors.push(
            `${worker.email}: ${err instanceof Error ? err.message : "Unknown error"}`,
          );
        }
      }

      if (successCount > 0) {
        setSuccessMessage(
          `Successfully added ${successCount} worker${successCount !== 1 ? "s" : ""}`,
        );
        reset();
      }

      if (errors.length > 0) {
        setErrorMessage(
          `Failed to add ${errors.length} worker${errors.length !== 1 ? "s" : ""}: ${errors.join("; ")}`,
        );
      }
    } catch (err) {
      setErrorMessage(
        `Error: ${err instanceof Error ? err.message : "Unknown error occurred"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Add Workers
            </h1>
            <p className="text-muted-foreground mt-2">
              Register new construction workers to your team
            </p>
          </div>
          <Button
            type="button"
            onClick={() =>
              append({
                email: "",
                fullName: "",
                phone: "",
                password: "",
                role: "worker",
              })
            }
            className="w-full sm:w-auto"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add One More Worker
          </Button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <Alert className="mb-6 bg-card border-border">
            <CheckCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-foreground">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Table Header for Desktop */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-secondary rounded-t-lg font-semibold text-foreground text-sm">
              <div className="col-span-2">Full Name</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Password</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Action</div>
            </div>

            {/* Worker Rows */}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    {/* Mobile Header */}
                    <div className="md:hidden mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Worker #{index + 1}
                      </h3>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Full Name */}
                      <div className="md:col-span-2">
                        <Label
                          htmlFor={`workers.${index}.fullName`}
                          className="md:hidden text-sm font-medium text-foreground mb-2 block"
                        >
                          Full Name
                        </Label>
                        <Input
                          {...register(`workers.${index}.fullName`)}
                          placeholder="John Doe"
                          className="w-full"
                        />
                        {errors.workers?.[index]?.fullName && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.workers[index]?.fullName?.message}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <Label
                          htmlFor={`workers.${index}.email`}
                          className="md:hidden text-sm font-medium text-foreground mb-2 block"
                        >
                          Email
                        </Label>
                        <Input
                          {...register(`workers.${index}.email`)}
                          type="email"
                          placeholder="john@example.com"
                          className="w-full"
                        />
                        {errors.workers?.[index]?.email && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.workers[index]?.email?.message}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="md:col-span-2">
                        <Label
                          htmlFor={`workers.${index}.phone`}
                          className="md:hidden text-sm font-medium text-foreground mb-2 block"
                        >
                          Phone
                        </Label>
                        <Input
                          {...register(`workers.${index}.phone`)}
                          placeholder="1234567890"
                          maxLength={10}
                          className="w-full"
                        />
                        {errors.workers?.[index]?.phone && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.workers[index]?.phone?.message}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="md:col-span-2">
                        <Label
                          htmlFor={`workers.${index}.password`}
                          className="md:hidden text-sm font-medium text-foreground mb-2 block"
                        >
                          Password
                        </Label>
                        <Input
                          {...register(`workers.${index}.password`)}
                          type="password"
                          placeholder="••••••••"
                          className="w-full"
                        />
                        {errors.workers?.[index]?.password && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.workers[index]?.password?.message}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      <div className="md:col-span-2">
                        <Label
                          htmlFor={`workers.${index}.role`}
                          className="md:hidden text-sm font-medium text-foreground mb-2 block"
                        >
                          Role
                        </Label>
                        <Select
                          value={control._formValues.workers?.[index]?.role || "worker"}
                          onValueChange={(value) =>
                            setValue(
                              `workers.${index}.role`,
                              value as "engineer" | "worker",
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="worker">Worker</SelectItem>
                            <SelectItem value="engineer">Engineer</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.workers?.[index]?.role && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.workers[index]?.role?.message}
                          </p>
                        )}
                      </div>

                      {/* Delete Button */}
                      <div className="md:col-span-2 flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1 || isLoading}
                          className="w-full md:w-auto"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => reset()}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding Workers...
                </div>
              ) : (
                "Add All Workers"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
