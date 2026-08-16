-- One public share per resource
CREATE UNIQUE INDEX "shares_public_resource_unique"
ON "shares"("resource_type", "resource_id")
WHERE "type" = 'PUBLIC';

-- One user share per resource and recipient
CREATE UNIQUE INDEX "shares_user_resource_unique"
ON "shares"("resource_type", "resource_id", "user_id")
WHERE "type" = 'USER';
