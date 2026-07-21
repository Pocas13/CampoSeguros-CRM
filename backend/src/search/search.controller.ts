import { Controller, Get, Query } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  search(
    @CurrentUser() user: AuthenticatedUser,
    @Query("q") query = "",
    @Query("limit") limit?: string,
  ) {
    return this.service.search(requireCompanyId(user), query, limit ? Number(limit) : undefined);
  }
}
