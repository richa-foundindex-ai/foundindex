import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const preventionOptions = [
  "Time constraints",
  "Budget limitations",
  "Technical expertise",
  "Unclear priorities",
  "Other",
];

const createFormSchema = (hasWebsite: boolean) =>
  z.object({
    website: hasWebsite
      ? z.string().optional()
      : z.string().url("Please enter a valid website URL").min(1, "Please enter your website URL"),
    surprisingResult: z.string().min(1, "Please share what surprised you"),
    describeToColleague: z.string().min(1, "Please describe how you'd explain this"),
    preventingImprovements: z.array(z.string()).min(1, "Please select at least one option"),
    userType: z.string().min(1, "Please select your role"),
    email: z.string().email("Please enter a valid email address"),
  });

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId?: string;
  score?: number;
  website?: string;
  isGeneralFeedback?: boolean;
}

export const FeedbackModal = ({
  open,
  onOpenChange,
  testId,
  score,
  website,
  isGeneralFeedback = false,
}: FeedbackModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const formSchema = createFormSchema(!!website);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website: website || "",
      surprisingResult: "",
      describeToColleague: "",
      preventingImprovements: [],
      userType: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-feedback", {
        body: {
          testId: testId || "general-feedback",
          score: score || 0,
          website: values.website || website || "",
          surprisingResult: values.surprisingResult || "",
          describeToColleague: values.describeToColleague || "",
          preventingImprovements: values.preventingImprovements?.join(", ") || "",
          userType: values.userType || "",
          email: values.email,
          isGeneralFeedback,
        },
      });

      if (error) throw error;

      setSubmittedEmail(values.email);
      setShowSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (showSuccess) {
      setShowSuccess(false);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="space-y-6 py-8">
            <DialogHeader>
              <DialogTitle className="text-2xl">Evaluation queued for delivery</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your detailed homepage evaluation will arrive within 48 hours at:{" "}
                <span className="font-semibold text-foreground">{submittedEmail}</span>
              </p>
              <Button
                onClick={() => {
                  handleClose();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full"
              >
                {isGeneralFeedback ? "← Back" : "← Back to results"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Get detailed homepage evaluation</DialogTitle>
              <DialogDescription className="text-sm pt-2">
                Submit feedback (60 seconds) to receive:
                <ul className="space-y-1 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Personalized homepage rewrite strategy (within 48 hours)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      Bonus: <strong>One</strong> blog post diagnostic (in exchange for LinkedIn review)
                    </span>
                  </li>
                </ul>
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {!website && (
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your website homepage URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourwebsite.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="surprisingResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What surprised you most about your results?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My authority score was lower than expected" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="describeToColleague"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How would you describe this tool to a colleague?</FormLabel>
                      <FormControl>
                        <Input placeholder="In one sentence..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preventingImprovements"
                  render={() => (
                    <FormItem>
                      <FormLabel>What's preventing you from making improvements?</FormLabel>
                      <div className="space-y-3 mt-3">
                        {preventionOptions.map((option) => (
                          <FormField
                            key={option}
                            control={form.control}
                            name="preventingImprovements"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, option])
                                        : field.onChange(field.value?.filter((value) => value !== option));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">{option}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What best describes you?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-3 mt-3">
                          {[
                            "Founder/Business Owner",
                            "SEO/Marketing Professional",
                            "Agency/Consultant",
                            "Content Strategist",
                            "Other",
                          ].map((option) => (
                            <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={option} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
