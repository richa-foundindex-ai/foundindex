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
  "I don't know which pages to fix first",
  "I don't know how to rewrite my content",
  "I can't tell if my changes actually helped",
  "I need to compare my site to competitors",
  "I don't have time to do this myself",
  "I need expert help",
  "Something else"
];

const createFormSchema = (isOptional: boolean) => z.object({
  surprisingResult: isOptional ? z.string().optional() : z.string().min(1, "Please share what surprised you"),
  describeToColleague: isOptional ? z.string().optional() : z.string().min(1, "Please describe how you'd explain this"),
  preventingImprovements: isOptional ? z.array(z.string()).optional() : z.array(z.string()).min(1, "Please select at least one option"),
  userType: isOptional ? z.string().optional() : z.string().min(1, "Please select your role"),
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

export const FeedbackModal = ({ open, onOpenChange, testId, score, website, isGeneralFeedback = false }: FeedbackModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const formSchema = createFormSchema(isGeneralFeedback);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
          website: website || "N/A",
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
              <DialogTitle className="text-2xl">Thank you for your feedback!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You'll receive your detailed homepage evaluation within 48 hours at{" "}
                <span className="font-semibold text-foreground">{submittedEmail}</span>.
              </p>
              <p className="text-muted-foreground">
                We'll also send details about getting a free blog post evaluation in exchange for a LinkedIn review.
              </p>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {isGeneralFeedback 
                  ? "Share your feedback"
                  : "Help us understand your experience and receive a detailed homepage evaluation"
                }
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Founder/Business Owner" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Founder/Business Owner</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Marketing Professional" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Marketing Professional</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Agency/Consultant" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Agency/Consultant</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Other" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Other</FormLabel>
                          </FormItem>
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
                  {isSubmitting ? "Submitting..." : "Submit feedback"}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
