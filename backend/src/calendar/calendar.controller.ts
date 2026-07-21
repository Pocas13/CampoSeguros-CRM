import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { CalendarService } from "./calendar.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";
import { UpdateCalendarEventDto } from "./dto/update-calendar-event.dto";

@Permissions(PERMISSIONS.CALENDAR_MANAGE)
@Controller("calendar")
export class CalendarController {
  constructor(private readonly service: CalendarService) {}
  @Get() findRange(@CurrentUser() user: AuthenticatedUser, @Query("from") from?: string, @Query("to") to?: string) { return this.service.findRange(user, from, to); }
  @Get("upcoming") upcoming(@CurrentUser() user: AuthenticatedUser, @Query("days") days?: string) { return this.service.upcoming(user, Number(days || 30)); }
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCalendarEventDto) { return this.service.create(user, dto); }
  @Patch(":id") update(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCalendarEventDto) { return this.service.update(user, id, dto); }
  @Delete(":id") remove(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.remove(user, id); }
}
